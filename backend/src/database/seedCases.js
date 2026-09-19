const { exec, run, get, all } = require('./db');
const { calculateEligibility } = require('../rules/eligibilityEngine');

// 12 controlled test cases covering all 12 offences
// in the updated seed.js.
// These are synthetic records for demonstration/testing only.

const testCases = [
  {
    case_number: 'TEST-001',
    prisoner_name: 'Arjun Mehta (Test)',
    section: '303(2)',
    custody_start_date: '2024-11-01',
    delay_days: 0,
    first_time: 0,
    multiple: 0,
    fir_number: 'TEST-FIR-2024-001',
    district: 'Central Delhi',
    court: 'Sessions Court, Tis Hazari',
    lawyer: 'Test Counsel'
  },

  {
    case_number: 'TEST-002',
    prisoner_name: 'Neha Kapoor (Test)',
    section: '304(2)',
    custody_start_date: '2025-01-15',
    delay_days: 0,
    first_time: 1,
    multiple: 0,
    fir_number: 'TEST-FIR-2025-002',
    district: 'South Delhi',
    court: 'Saket District Court',
    lawyer: 'Test Counsel'
  },

  {
    case_number: 'TEST-003',
    prisoner_name: 'Rohan Sharma (Test)',
    section: '305',
    custody_start_date: '2024-01-01',
    delay_days: 0,
    first_time: 0,
    multiple: 0,
    fir_number: 'TEST-FIR-2024-003',
    district: 'North Delhi',
    court: 'Sessions Court, Rohini',
    lawyer: 'Test Counsel'
  },

  {
    case_number: 'TEST-004',
    prisoner_name: 'Karan Malhotra (Test)',
    section: '306',
    custody_start_date: '2025-03-01',
    delay_days: 30,
    first_time: 1,
    multiple: 0,
    fir_number: 'TEST-FIR-2025-004',
    district: 'West Delhi',
    court: 'Sessions Court, Tis Hazari',
    lawyer: 'Test Counsel'
  },

  {
    case_number: 'TEST-005',
    prisoner_name: 'Vivek Nair (Test)',
    section: '316(2)',
    custody_start_date: '2024-06-01',
    delay_days: 0,
    first_time: 0,
    multiple: 0,
    fir_number: 'TEST-FIR-2024-005',
    district: 'East Delhi',
    court: 'Karkardooma District Court',
    lawyer: 'Test Counsel'
  },

  {
    case_number: 'TEST-006',
    prisoner_name: 'Ananya Rao (Test)',
    section: '318(2)',
    custody_start_date: '2025-01-01',
    delay_days: 0,
    first_time: 1,
    multiple: 0,
    fir_number: 'TEST-FIR-2025-006',
    district: 'South Delhi',
    court: 'Saket District Court',
    lawyer: 'Test Counsel'
  },

  {
    case_number: 'TEST-007',
    prisoner_name: 'Manish Gupta (Test)',
    section: '318(4)',
    custody_start_date: '2024-02-01',
    delay_days: 0,
    first_time: 0,
    multiple: 0,
    fir_number: 'TEST-FIR-2024-007',
    district: 'Central Delhi',
    court: 'Sessions Court, Tis Hazari',
    lawyer: 'Test Counsel'
  },

  {
    case_number: 'TEST-008',
    prisoner_name: 'Pooja Verma (Test)',
    section: '329(3)',
    custody_start_date: '2026-06-01',
    delay_days: 0,
    first_time: 1,
    multiple: 0,
    fir_number: 'TEST-FIR-2026-008',
    district: 'West Delhi',
    court: 'Dwarka District Court',
    lawyer: 'Test Counsel'
  },

  {
    case_number: 'TEST-009',
    prisoner_name: 'Aditya Singh (Test)',
    section: '351(2)',
    custody_start_date: '2025-01-01',
    delay_days: 0,
    first_time: 0,
    multiple: 0,
    fir_number: 'TEST-FIR-2025-009',
    district: 'North-East Delhi',
    court: 'Karkardooma District Court',
    lawyer: 'Test Counsel'
  },

  {
    case_number: 'TEST-010',
    prisoner_name: 'Rahul Joshi (Test)',
    section: '132',
    custody_start_date: '2025-04-01',
    delay_days: 45,
    first_time: 0,
    multiple: 0,
    fir_number: 'TEST-FIR-2025-010',
    district: 'South-West Delhi',
    court: 'Dwarka District Court',
    lawyer: 'Test Counsel'
  },

  {
    case_number: 'TEST-011',
    prisoner_name: 'Sanjay Kumar (Test)',
    section: '121(1)',
    custody_start_date: '2024-08-01',
    delay_days: 0,
    first_time: 0,
    multiple: 1,
    fir_number: 'TEST-FIR-2024-011',
    district: 'East Delhi',
    court: 'Karkardooma District Court',
    lawyer: 'Test Counsel'
  },

  {
    case_number: 'TEST-012',
    prisoner_name: 'Vikram Reddy (Test)',
    section: '103(1)',
    custody_start_date: '2023-06-01',
    delay_days: 0,
    first_time: 0,
    multiple: 0,
    fir_number: 'TEST-FIR-2023-012',
    district: 'North Delhi',
    court: 'Sessions Court, Rohini',
    lawyer: 'Test Counsel'
  }
];

async function seedTestCases() {
  try {
    // Clear existing case records
    await exec('DELETE FROM cases');

    // Fixed reference date for reproducible hackathon results
    const referenceDate = new Date('2026-09-18T00:00:00Z');

    for (const c of testCases) {

      // Find the corresponding offence from the offences table
      const offence = await get(
        'SELECT * FROM offences WHERE section = ?',
        [c.section]
      );

      if (!offence) {
        console.warn(
          `Offence with section ${c.section} not found. ` +
          `Skipping case ${c.case_number}.`
        );
        continue;
      }

      // Prepare data for the eligibility engine
      const caseData = {
        custodyStartDate: c.custody_start_date,
        delayDays: c.delay_days,
        firstTimeOffender: c.first_time === 1,
        multiplePendingCases: c.multiple === 1
      };

      // Calculate eligibility
      const result = calculateEligibility(
        caseData,
        offence,
        referenceDate
      );

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
          eligibility_result
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          c.case_number,
          c.prisoner_name,
          c.fir_number,
          c.district,
          c.court,
          c.lawyer,
          offence.id,
          c.custody_start_date,
          c.delay_days,
          c.first_time,
          c.multiple,
          result.status,
          JSON.stringify(result)
        ]
      );

      console.log(
        `  ${c.case_number} | ${c.section} | ` +
        `${c.prisoner_name} -> ${result.status}`
      );
    }

    // Verify inserted records
    const rows = await all('SELECT * FROM cases');

    console.log(
      `\nSuccessfully seeded ${rows.length} test cases.`
    );

  } catch (error) {
    console.error('Error seeding test cases:', error);
  }
}

seedTestCases();