const express = require('express');
const { all } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// =====================================================
// GET /api/legal-aid/lawyers
// Factual Legal-Aid Lawyer Directory linking directly to authenticated USERS
// =====================================================
router.get('/lawyers', authenticateToken, async (req, res) => {
  try {
    const { district } = req.query;

    let query = `
      SELECT 
        u.id as id,
        u.id as userId,
        u.name as name,
        u.email as email,
        u.role as role,
        lp.practice_area as practiceArea,
        lp.practice_area as practice_area,
        lp.languages as languages,
        lp.district as district,
        lp.legal_aid_available as legalAidAvailable,
        lp.availability_status as availabilityStatus,
        lp.availability_status as availability_status,
        lp.current_workload as currentWorkload,
        lp.current_workload as current_workload,
        lp.enrollment_number as enrollmentNumber,
        lp.phone as phone
      FROM users u
      JOIN lawyer_profiles lp ON u.id = lp.user_id
      WHERE u.role = 'LAWYER' AND lp.legal_aid_available = 1
    `;
    const params = [];

    if (district) {
      query += ` AND lower(lp.district) = lower(?)`;
      params.push(district);
    }

    query += ` ORDER BY u.name ASC`;

    const rows = await all(query, params);

    res.json({
      success: true,
      lawyers: rows
    });
  } catch (error) {
    console.error('Lawyers directory error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
