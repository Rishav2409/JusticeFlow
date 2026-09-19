const express = require('express');
const { get, run, all } = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Require POLICE role
router.use(authenticateToken, requireRole('POLICE'));

// =====================================================
// GET /api/police/cases
// Returns cases for police monitoring and verification
// =====================================================
router.get('/cases', async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = `
      SELECT c.id, c.case_number, c.prisoner_name, c.fir_number, c.district, c.court, c.custody_start_date,
             c.eligibility_status, c.verification_status, c.verified_by, c.verified_at,
             o.offence_name, o.section, o.law_code
      FROM cases c
      JOIN offences o ON c.offence_id = o.id
    `;
    const params = [];
    const conditions = [];

    if (status) {
      conditions.push(`c.verification_status = ?`);
      params.push(status.toUpperCase());
    }

    if (search) {
      conditions.push(`(c.case_number LIKE ? OR c.prisoner_name LIKE ? OR c.fir_number LIKE ?)`);
      const q = `%${search.trim()}%`;
      params.push(q, q, q);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY c.created_at DESC`;

    const rows = await all(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Police cases error:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// GET /api/police/cases/:id
// Get authorized case detail
// =====================================================
router.get('/cases/:id', async (req, res) => {
  try {
    const caseRow = await get(
      `SELECT c.id, c.case_number, c.prisoner_name, c.fir_number, c.district, c.court, c.custody_start_date,
              c.eligibility_status, c.verification_status, c.verified_by, c.verified_at,
              o.offence_name, o.section, o.law_code
       FROM cases c
       JOIN offences o ON c.offence_id = o.id
       WHERE c.id = ? OR lower(c.case_number) = lower(?)`,
      [req.params.id, req.params.id]
    );

    if (!caseRow) {
      return res.status(404).json({ error: 'Case not found.' });
    }

    const verifications = await all(
      `SELECT * FROM case_verifications WHERE case_id = ? ORDER BY verified_at DESC`,
      [caseRow.id]
    );

    res.json({
      ...caseRow,
      history: verifications
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// POST /api/police/cases/:id/verify
// Perform case verification
// =====================================================
router.post('/cases/:id/verify', async (req, res) => {
  try {
    const { notes } = req.body;
    const officerName = req.user.name || 'Police Verification Officer';
    const officerId = req.user.id;

    const caseRow = await get('SELECT * FROM cases WHERE id = ?', [req.params.id]);
    if (!caseRow) {
      return res.status(404).json({ error: 'Case not found.' });
    }

    // Update case record
    await run(
      `UPDATE cases 
       SET verification_status = 'VERIFIED', verified_by = ?, verified_at = datetime('now')
       WHERE id = ?`,
      [officerName, caseRow.id]
    );

    // Insert verification log
    await run(
      `INSERT INTO case_verifications (case_id, case_number, verified_by, officer_name, status, notes)
       VALUES (?, ?, ?, ?, 'VERIFIED', ?)`,
      [caseRow.id, caseRow.case_number, officerId, officerName, notes || 'Factual details verified as per station records']
    );

    const updated = await get('SELECT * FROM cases WHERE id = ?', [caseRow.id]);

    res.json({
      success: true,
      message: `Case ${caseRow.case_number} verified successfully.`,
      case: updated
    });
  } catch (error) {
    console.error('Verify case error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

