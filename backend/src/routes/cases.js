const express = require('express');
const { get, run, all } = require('../database/db');
const { calculateEligibility } = require('../rules/eligibilityEngine');

const router = express.Router();

// POST /api/cases - Create a new case and calculate eligibility
router.post('/', async (req, res) => {
  try {
    const {
      case_number,
      prisoner_name,
      fir_number,
      district,
      court,
      lawyer,
      offence_id,
      custody_start_date,
      delay_days = 0,
      first_time_offender = 0,
      multiple_pending_cases = 0
    } = req.body;

    // Validate required fields
    if (!case_number || !prisoner_name || !offence_id || !custody_start_date) {
      return res.status(400).json({
        error:
          'Required case information is missing. Please provide case number, prisoner name, offence, and custody start date.'
      });
    }

    // Fetch offence
    const offence = await get(
      'SELECT * FROM offences WHERE id = ?',
      [offence_id]
    );

    if (!offence) {
      return res.status(404).json({
        error: 'Offence not found.'
      });
    }

    // Build case data for eligibility engine
    const caseData = {
      custodyStartDate: custody_start_date,
      delayDays: parseInt(delay_days) || 0,
      firstTimeOffender:
        first_time_offender === 1 || first_time_offender === true,
      multiplePendingCases:
        multiple_pending_cases === 1 || multiple_pending_cases === true,
    };

    // Run eligibility calculation
    const result = calculateEligibility(caseData, offence);

    const created_by = req.user?.id || null;
    const created_by_role = req.user?.role || 'POLICE';
    const verified_by = req.user?.name || 'Registering Officer';

    // Insert case into database
    await run(
      `INSERT INTO cases (
        case_number,
        prisoner_name,
        fir_number,
        district,
        court,
        lawyer,
        offence_id,
        custody_start_date,
        delay_days,
        first_time_offender,
        multiple_pending_cases,
        eligibility_status,
        eligibility_result,
        verification_status,
        verified_by,
        verified_at,
        created_by,
        created_by_role
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'VERIFIED', ?, datetime('now'), ?, ?)`,
      [
        case_number,
        prisoner_name,
        fir_number || null,
        district || null,
        court || null,
        lawyer || null,
        offence_id,
        custody_start_date,
        caseData.delayDays,
        caseData.firstTimeOffender ? 1 : 0,
        caseData.multiplePendingCases ? 1 : 0,
        result.status,
        JSON.stringify(result),
        verified_by,
        created_by,
        created_by_role
      ]
    );

    // Fetch the newly created case using the unique Case ID.
    // This avoids relying on the database wrapper's insert-ID property.
    const newCase = await get(
      `SELECT
        c.*,
        o.offence_name,
        o.section,
        o.law_code,
        o.max_imprisonment_years,
        o.max_imprisonment_days,
        o.death_or_life_exclusion
       FROM cases c
       JOIN offences o ON c.offence_id = o.id
       WHERE c.case_number = ?`,
      [case_number]
    );

    if (!newCase) {
      return res.status(500).json({
        error: 'Case was created but could not be retrieved.'
      });
    }

    // Convert stored JSON string back into an object
    if (newCase.eligibility_result) {
      newCase.eligibility_result = JSON.parse(
        newCase.eligibility_result
      );
    }

    // Return the complete newly created case
    res.status(201).json(newCase);

  } catch (error) {
    // Handle unique constraint violation for case_number
    if (error.message && error.message.includes('UNIQUE')) {
      return res.status(409).json({
        error: 'A case with this Case ID already exists.'
      });
    }

    console.error('Failed to create case:', error);

    res.status(400).json({
      error: error.message
    });
  }
});

// GET /api/cases - List all cases
router.get('/', async (req, res) => {
  try {
    const rows = await all(
      `SELECT
        c.*,
        o.offence_name,
        o.section,
        o.law_code
       FROM cases c
       JOIN offences o ON c.offence_id = o.id
       ORDER BY c.created_at DESC`
    );

    const parsedRows = rows.map(r => ({
      ...r,
      eligibility_result: r.eligibility_result
        ? JSON.parse(r.eligibility_result)
        : null,
    }));

    res.json(parsedRows);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// GET /api/cases/:id - Get a single case with full result
router.get('/:id', async (req, res) => {
  try {
    const row = await get(
      `SELECT
        c.*,
        o.offence_name,
        o.section,
        o.law_code,
        o.max_imprisonment_years,
        o.max_imprisonment_days,
        o.death_or_life_exclusion
       FROM cases c
       JOIN offences o ON c.offence_id = o.id
       WHERE c.id = ?`,
      [req.params.id]
    );

    if (!row) {
      return res.status(404).json({
        error: 'Case not found.'
      });
    }

    if (row.eligibility_result) {
      row.eligibility_result = JSON.parse(
        row.eligibility_result
      );
    }

    res.json(row);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;