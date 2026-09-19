const express = require('express');
const { get, run, all } = require('../database/db');
const { calculateEligibility } = require('../rules/eligibilityEngine');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Require family member role for all endpoints in this router
router.use(authenticateToken, requireRole('FAMILY_MEMBER'));

// =====================================================
// GET /api/family/cases/:caseNumber
// Look up case and run deterministic preliminary screening
// =====================================================
router.get('/cases/:caseNumber', async (req, res) => {
  try {
    const caseNumber = req.params.caseNumber?.trim();
    if (!caseNumber) {
      return res.status(400).json({ error: 'Please enter a case number.' });
    }

    const caseRow = await get(
      `SELECT c.*, o.offence_name, o.section, o.law_code, o.max_imprisonment_years, o.max_imprisonment_days, o.death_or_life_exclusion
       FROM cases c
       JOIN offences o ON c.offence_id = o.id
       WHERE lower(c.case_number) = lower(?)`,
      [caseNumber]
    );

    if (!caseRow) {
      return res.status(404).json({
        error: 'Case not found. Please check the case number.'
      });
    }

    // Run existing deterministic eligibility calculation
    const caseData = {
      custodyStartDate: caseRow.custody_start_date,
      delayDays: parseInt(caseRow.delay_days) || 0,
      firstTimeOffender: caseRow.first_time_offender === 1,
      multiplePendingCases: caseRow.multiple_pending_cases === 1,
    };

    const offenceData = {
      id: caseRow.offence_id,
      offence_name: caseRow.offence_name,
      section: caseRow.section,
      law_code: caseRow.law_code,
      max_imprisonment_years: caseRow.max_imprisonment_years,
      max_imprisonment_days: caseRow.max_imprisonment_days,
      death_or_life_exclusion: caseRow.death_or_life_exclusion,
    };

    const screening = calculateEligibility(caseData, offenceData);

    // Determine status description according to Review 2 guidelines
    let statusLabel = 'NOT YET AT THRESHOLD';
    let isPotentiallyEligible = false;

    if (screening.status === 'ELIGIBLE_NOW') {
      statusLabel = 'POTENTIALLY ELIGIBLE';
      isPotentiallyEligible = true;
    } else if (screening.daysRemaining <= 30 && screening.daysRemaining > 0) {
      statusLabel = 'APPROACHING THRESHOLD';
    } else if (screening.status === 'EXCLUDED') {
      statusLabel = 'STATUTORILY EXCLUDED';
    }

    // Check if an active legal aid request already exists for this case
    const existingRequest = await get(
      `SELECT * FROM legal_aid_requests WHERE case_id = ? AND status IN ('PENDING', 'UNDER_REVIEW', 'ACCEPTED')`,
      [caseRow.id]
    );

    res.json({
      id: caseRow.id,
      case_number: caseRow.case_number,
      prisoner_name: caseRow.prisoner_name,
      district: caseRow.district || 'Not specified',
      court: caseRow.court || 'Competent Court',
      offence_name: `${caseRow.section} ${caseRow.law_code} — ${caseRow.offence_name}`,
      custody_start_date: caseRow.custody_start_date,
      custody_duration_days: screening.totalCustodyDays,
      delay_days: screening.delayDays,
      credited_detention_days: screening.creditedDetentionDays,
      configured_threshold_days: screening.thresholdDays,
      days_beyond_threshold: screening.daysOverThreshold,
      days_remaining: screening.daysRemaining,
      status: screening.status,
      status_label: statusLabel,
      is_potentially_eligible: isPotentiallyEligible,
      threshold_date: screening.thresholdDate,
      can_request_assistance: isPotentiallyEligible,
      existing_request: existingRequest || null,
      disclaimer: 'This is a preliminary screening result based on configured statutory rules. It does not constitute legal advice, determine final entitlement to bail, or replace review by a qualified legal professional or competent court.'
    });
  } catch (error) {
    console.error('Family case lookup error:', error);
    res.status(500).json({ error: error.message || 'An error occurred during case lookup.' });
  }
});

// =====================================================
// POST /api/family/legal-aid-requests
// Submit legal aid assistance request
// =====================================================
router.post('/legal-aid-requests', async (req, res) => {
  try {
    const { case_id, case_number, selected_lawyer_id, family_phone, notes } = req.body;

    if (!case_id && !case_number) {
      return res.status(400).json({ error: 'Case identification is required.' });
    }

    const caseRow = await get(
      `SELECT c.*, o.offence_name, o.section, o.law_code, o.max_imprisonment_years, o.max_imprisonment_days, o.death_or_life_exclusion
       FROM cases c
       JOIN offences o ON c.offence_id = o.id
       WHERE c.id = ? OR lower(c.case_number) = lower(?)`,
      [case_id || 0, (case_number || '').trim()]
    );

    if (!caseRow) {
      return res.status(404).json({ error: 'Case not found.' });
    }

    // Run screening to record factual metrics for the lawyer
    const screening = calculateEligibility(
      {
        custodyStartDate: caseRow.custody_start_date,
        delayDays: parseInt(caseRow.delay_days) || 0,
        firstTimeOffender: caseRow.first_time_offender === 1,
        multiplePendingCases: caseRow.multiple_pending_cases === 1,
      },
      caseRow
    );

    // Compute priority indicators
    const priorityReasons = [];
    let priorityLevel = 'NORMAL';

    if (screening.status === 'ELIGIBLE_NOW') {
      priorityReasons.push('Threshold reached ✓');
      if (screening.daysOverThreshold > 15) {
        priorityLevel = 'HIGH_ATTENTION';
        priorityReasons.push(`${screening.daysOverThreshold} days beyond configured threshold ✓`);
      } else {
        priorityLevel = 'MEDIUM';
        priorityReasons.push(`${screening.daysOverThreshold} days beyond threshold ✓`);
      }
      if (screening.creditedDetentionDays > 180) {
        priorityReasons.push(`Long custody duration (${screening.creditedDetentionDays} days) ✓`);
      }
    } else if (screening.daysRemaining <= 30) {
      priorityLevel = 'APPROACHING';
      priorityReasons.push(`Approaching threshold (${screening.daysRemaining} days remaining)`);
    }

    priorityReasons.push('Request awaiting lawyer review ✓');

    // Lawyer assignment
    let lawyerName = 'Legal-Aid Duty Queue';
    if (selected_lawyer_id) {
      let lawyerRow = await get('SELECT name FROM users WHERE id = ?', [selected_lawyer_id]);
      if (!lawyerRow) {
        lawyerRow = await get('SELECT name FROM lawyers WHERE id = ?', [selected_lawyer_id]);
      }
      if (lawyerRow) lawyerName = lawyerRow.name;
    }

    const requestId = `REQ-${Date.now().toString().slice(-6)}`;
    const familyMemberName = req.user.name || 'Family Member';
    const familyMemberId = req.user.id;

    await run(
      `INSERT INTO legal_aid_requests (
        request_id, case_id, case_number, prisoner_name, offence_name,
        custody_duration_days, configured_threshold_days, days_beyond_threshold,
        family_member_id, family_member_name, family_member_phone,
        lawyer_id, lawyer_name, status, priority_level, priority_reasons, request_age_days, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        requestId,
        caseRow.id,
        caseRow.case_number,
        caseRow.prisoner_name,
        `${caseRow.section} ${caseRow.law_code} (${caseRow.offence_name})`,
        screening.creditedDetentionDays,
        screening.thresholdDays,
        screening.daysOverThreshold,
        familyMemberId,
        familyMemberName,
        family_phone || '+91 98765 00000',
        selected_lawyer_id || null,
        lawyerName,
        'PENDING',
        priorityLevel,
        JSON.stringify(priorityReasons),
        0,
        notes || null
      ]
    );

    const created = await get('SELECT * FROM legal_aid_requests WHERE request_id = ?', [requestId]);
    if (created && created.priority_reasons) {
      created.priority_reasons = JSON.parse(created.priority_reasons);
    }

    res.status(201).json({
      success: true,
      message: 'Legal-aid assistance request submitted successfully.',
      id: created.id,
      request_id: created.request_id,
      request: created
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: error.message || 'Failed to submit legal aid request.' });
  }
});

// =====================================================
// GET /api/family/legal-aid-requests
// List requests for the authenticated family member
// =====================================================
router.get('/legal-aid-requests', async (req, res) => {
  try {
    const rows = await all(
      `SELECT * FROM legal_aid_requests
       WHERE family_member_id = ? OR family_member_id = 'FAMILY-001'
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    const parsed = rows.map(r => ({
      ...r,
      priority_reasons: r.priority_reasons ? JSON.parse(r.priority_reasons) : []
    }));

    res.json(parsed);
  } catch (error) {
    console.error('Fetch family requests error:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// GET /api/family/legal-aid-requests/:id
// Get single request details
// =====================================================
router.get('/legal-aid-requests/:id', async (req, res) => {
  try {
    const request = await get(
      `SELECT * FROM legal_aid_requests WHERE id = ? OR request_id = ?`,
      [req.params.id, req.params.id]
    );

    if (!request) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    if (request.priority_reasons) {
      request.priority_reasons = JSON.parse(request.priority_reasons);
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

