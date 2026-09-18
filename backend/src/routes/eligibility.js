const express = require('express');
const { get } = require('../database/db');
const { calculateEligibility } = require('../rules/eligibilityEngine');

const router = express.Router();

// POST /api/eligibility/calculate - Dry-run calculation (no save)
router.post('/calculate', async (req, res) => {
  try {
    const { offence_id, custody_start_date, delay_days = 0, first_time_offender = 0, multiple_pending_cases = 0 } = req.body;

    if (!offence_id || !custody_start_date) {
      return res.status(400).json({ error: 'Missing required fields: offence_id and custody_start_date are required.' });
    }

    const offence = await get('SELECT * FROM offences WHERE id = ?', [offence_id]);
    if (!offence) {
      return res.status(404).json({ error: 'Offence not found.' });
    }

    const caseData = {
      custodyStartDate: custody_start_date,
      delayDays: parseInt(delay_days) || 0,
      firstTimeOffender: first_time_offender === 1 || first_time_offender === true,
      multiplePendingCases: multiple_pending_cases === 1 || multiple_pending_cases === true,
    };

    const result = calculateEligibility(caseData, offence);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
