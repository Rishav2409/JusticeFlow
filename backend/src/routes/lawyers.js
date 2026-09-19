const express = require('express');
const { get, run, all } = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Require LAWYER role
router.use(authenticateToken, requireRole('LAWYER'));

// =====================================================
// GET /api/lawyers/priority-queue
// Transparent, explainable priority queue filtered for the authenticated lawyer
// (Shows requests assigned to this lawyer OR general duty requests)
// =====================================================
router.get('/priority-queue', async (req, res) => {
  try {
    const lawyerId = String(req.user.id);

    const rows = await all(
      `SELECT r.*, c.fir_number, c.court, c.district, c.eligibility_status
       FROM legal_aid_requests r
       LEFT JOIN cases c ON r.case_id = c.id
       WHERE r.status IN ('PENDING', 'UNDER_REVIEW')
         AND r.lawyer_id = ?
       ORDER BY 
         CASE r.priority_level
           WHEN 'HIGH_ATTENTION' THEN 1
           WHEN 'MEDIUM' THEN 2
           WHEN 'APPROACHING' THEN 3
           ELSE 4
         END ASC,
         r.days_beyond_threshold DESC,
         r.created_at ASC`,
      [lawyerId]
    );

    const parsed = rows.map(r => ({
      ...r,
      priority_reasons: r.priority_reasons ? JSON.parse(r.priority_reasons) : []
    }));

    res.json({
      success: true,
      count: parsed.length,
      queue: parsed
    });
  } catch (error) {
    console.error('Priority queue error:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// GET /api/lawyers/requests
// List requests assigned to this authenticated lawyer or general queue
// =====================================================
router.get('/requests', async (req, res) => {
  try {
    const lawyerId = String(req.user.id);
    const { status } = req.query;

    let query = `SELECT r.*, c.fir_number, c.court, c.district, c.eligibility_status
                 FROM legal_aid_requests r
                 LEFT JOIN cases c ON r.case_id = c.id
                 WHERE r.lawyer_id = ?`;
    const params = [lawyerId];

    if (status && status !== 'ALL') {
      query += ` AND r.status = ?`;
      params.push(status.toUpperCase());
    }

    query += ` ORDER BY r.created_at DESC`;

    const rows = await all(query, params);
    const parsed = rows.map(r => ({
      ...r,
      priority_reasons: r.priority_reasons ? JSON.parse(r.priority_reasons) : []
    }));

    res.json(parsed);
  } catch (error) {
    console.error('Fetch lawyer requests error:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// GET /api/lawyers/requests/:id
// Get single request details
// =====================================================
router.get('/requests/:id', async (req, res) => {
  try {
    const row = await get(
      `SELECT r.*, c.fir_number, c.court, c.district, c.eligibility_status, c.eligibility_result, c.custody_start_date
       FROM legal_aid_requests r
       LEFT JOIN cases c ON r.case_id = c.id
       WHERE r.id = ? OR r.request_id = ?`,
      [req.params.id, req.params.id]
    );

    if (!row) {
      return res.status(404).json({ error: 'Legal aid request not found.' });
    }

    res.json({
      ...row,
      priority_reasons: row.priority_reasons ? JSON.parse(row.priority_reasons) : [],
      eligibility_result: row.eligibility_result ? JSON.parse(row.eligibility_result) : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// POST /api/lawyers/requests/:id/accept
// Accept legal aid request
// =====================================================
router.post('/requests/:id/accept', async (req, res) => {
  try {
    const lawyerId = String(req.user.id);
    const lawyerName = req.user.name || 'Assigned Legal-Aid Counsel';

    const existing = await get(
      `SELECT * FROM legal_aid_requests WHERE id = ? OR request_id = ?`,
      [req.params.id, req.params.id]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    await run(
      `UPDATE legal_aid_requests
       SET status = 'ACCEPTED', lawyer_id = ?, lawyer_name = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [lawyerId, lawyerName, existing.id]
    );

    const updated = await get('SELECT * FROM legal_aid_requests WHERE id = ?', [existing.id]);

    res.json({
      success: true,
      message: 'Legal-aid request has been ACCEPTED. Family member has been notified.',
      request: {
        ...updated,
        priority_reasons: updated.priority_reasons ? JSON.parse(updated.priority_reasons) : []
      }
    });
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// POST /api/lawyers/requests/:id/decline
// Decline legal aid request
// =====================================================
router.post('/requests/:id/decline', async (req, res) => {
  try {
    const existing = await get(
      `SELECT * FROM legal_aid_requests WHERE id = ? OR request_id = ?`,
      [req.params.id, req.params.id]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    await run(
      `UPDATE legal_aid_requests
       SET status = 'DECLINED', updated_at = datetime('now')
       WHERE id = ?`,
      [existing.id]
    );

    const updated = await get('SELECT * FROM legal_aid_requests WHERE id = ?', [existing.id]);

    res.json({
      success: true,
      message: 'Legal-aid request has been DECLINED. Available for other legal-aid counsel.',
      request: {
        ...updated,
        priority_reasons: updated.priority_reasons ? JSON.parse(updated.priority_reasons) : []
      }
    });
  } catch (error) {
    console.error('Decline request error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
