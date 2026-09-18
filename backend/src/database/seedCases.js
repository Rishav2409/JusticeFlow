const { exec, run, get, all } = require('./db');
const { calculateEligibility } = require('../rules/eligibilityEngine');

const demoCases = [
  { case_number: 'DEMO-001', prisoner_name: 'Rajesh Kumar (Demo)', section: '303(2)', custody_start_date: '2024-11-01', delay_days: 0, first_time: 0, multiple: 0, fir_number: 'FIR-2024-0441', district: 'Central Delhi', court: 'Sessions Court, Tis Hazari', lawyer: 'Adv. Demo Counsel' },
  { case_number: 'DEMO-002', prisoner_name: 'Priya Sharma (Demo)', section: '318(4)', custody_start_date: '2025-05-01', delay_days: 0, first_time: 1, multiple: 0, fir_number: 'FIR-2025-0123', district: 'South Delhi', court: 'CMM Court, Saket', lawyer: 'Adv. Demo Counsel' },
  { case_number: 'DEMO-003', prisoner_name: 'Amit Singh (Demo)', section: '121(1)', custody_start_date: '2026-01-01', delay_days: 0, first_time: 0, multiple: 0, fir_number: 'FIR-2025-0892', district: 'East Delhi', court: 'Sessions Court, KKD', lawyer: 'Adv. Demo Counsel' },
  { case_number: 'DEMO-004', prisoner_name: 'Suresh Patel (Demo)', section: '303(2)', custody_start_date: '2024-11-01', delay_days: 0, first_time: 0, multiple: 1, fir_number: 'FIR-2024-0556', district: 'West Delhi', court: 'Sessions Court, Tis Hazari', lawyer: 'Adv. Demo Counsel' },
  { case_number: 'DEMO-005', prisoner_name: 'Vikram Reddy (Demo)', section: '103(1)', custody_start_date: '2024-01-01', delay_days: 0, first_time: 0, multiple: 0, fir_number: 'FIR-2023-1201', district: 'North Delhi', court: 'Sessions Court, Rohini', lawyer: 'Adv. Demo Counsel' },
  { case_number: 'DEMO-006', prisoner_name: 'Deepak Verma (Demo)', section: '309(2)', custody_start_date: '2025-01-01', delay_days: 120, first_time: 0, multiple: 0, fir_number: 'FIR-2024-0789', district: 'South-West Delhi', court: 'CMM Court, Dwarka', lawyer: 'Adv. Demo Counsel' },
];

async function seedDemoCases() {
  try {
    await exec('DELETE FROM cases');

    const referenceDate = new Date('2026-09-18T00:00:00Z');

    for (const c of demoCases) {
      const offence = await get('SELECT * FROM offences WHERE section = ?', [c.section]);
      if (!offence) {
        console.warn(`Offence with section ${c.section} not found, skipping case ${c.case_number}`);
        continue;
      }

      const caseData = {
        custodyStartDate: c.custody_start_date,
        delayDays: c.delay_days,
        firstTimeOffender: c.first_time === 1,
        multiplePendingCases: c.multiple === 1,
      };

      const result = calculateEligibility(caseData, offence, referenceDate);

      await run(
        `INSERT INTO cases (case_number, prisoner_name, fir_number, district, court, lawyer, offence_id, custody_start_date, delay_days, first_time_offender, multiple_pending_cases, eligibility_status, eligibility_result)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.case_number, c.prisoner_name, c.fir_number, c.district, c.court, c.lawyer, offence.id, c.custody_start_date, c.delay_days, c.first_time, c.multiple, result.status, JSON.stringify(result)]
      );

      console.log(`  ${c.case_number} (${c.prisoner_name}) -> ${result.status}`);
    }

    const rows = await all('SELECT * FROM cases');
    console.log(`\nSuccessfully seeded ${rows.length} demo cases.`);
  } catch (error) {
    console.error('Error seeding demo cases:', error);
  }
}

seedDemoCases();
