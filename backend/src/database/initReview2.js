const { getDb, exec, run, get, all } = require('./db');
const { hashPassword } = require('../utils/crypto');
const { calculateEligibility } = require('../rules/eligibilityEngine');

async function initReview2() {
  await getDb();

  // 1. Create Review 2 Tables
  await exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      district TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS lawyer_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT UNIQUE NOT NULL,
      practice_area TEXT NOT NULL,
      languages TEXT NOT NULL,
      district TEXT NOT NULL,
      legal_aid_available INTEGER NOT NULL DEFAULT 1,
      availability_status TEXT NOT NULL DEFAULT 'AVAILABLE',
      current_workload TEXT NOT NULL DEFAULT 'LOW',
      enrollment_number TEXT,
      phone TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Legacy lawyers table preserved for backward compatibility
    CREATE TABLE IF NOT EXISTS lawyers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      practice_area TEXT NOT NULL,
      languages TEXT NOT NULL,
      district TEXT NOT NULL,
      legal_aid_available INTEGER NOT NULL DEFAULT 1,
      availability_status TEXT NOT NULL DEFAULT 'AVAILABLE',
      current_workload TEXT NOT NULL DEFAULT 'LOW',
      enrollment_number TEXT,
      phone TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS legal_aid_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id TEXT UNIQUE NOT NULL,
      case_id INTEGER NOT NULL,
      case_number TEXT NOT NULL,
      prisoner_name TEXT NOT NULL,
      offence_name TEXT NOT NULL,
      custody_duration_days INTEGER NOT NULL DEFAULT 0,
      configured_threshold_days INTEGER NOT NULL DEFAULT 0,
      days_beyond_threshold INTEGER NOT NULL DEFAULT 0,
      family_member_id TEXT NOT NULL,
      family_member_name TEXT NOT NULL,
      family_member_phone TEXT,
      lawyer_id TEXT,
      lawyer_name TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      priority_level TEXT NOT NULL DEFAULT 'NORMAL',
      priority_reasons TEXT,
      request_age_days INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (case_id) REFERENCES cases(id)
    );

    CREATE TABLE IF NOT EXISTS case_verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id INTEGER NOT NULL,
      case_number TEXT NOT NULL,
      verified_by TEXT NOT NULL,
      officer_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'VERIFIED',
      notes TEXT,
      verified_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (case_id) REFERENCES cases(id)
    );
  `);

  // Ensure cases table has all needed audit columns
  const alterColumns = [
    `ALTER TABLE cases ADD COLUMN verification_status TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION'`,
    `ALTER TABLE cases ADD COLUMN verified_by TEXT`,
    `ALTER TABLE cases ADD COLUMN verified_at TEXT`,
    `ALTER TABLE cases ADD COLUMN created_by TEXT`,
    `ALTER TABLE cases ADD COLUMN created_by_role TEXT`,
  ];
  for (const sql of alterColumns) {
    try {
      await exec(sql);
    } catch (e) {
      // Column might already exist
    }
  }

  // Ensure notes column in legal_aid_requests
  try {
    await exec(`ALTER TABLE legal_aid_requests ADD COLUMN notes TEXT`);
  } catch (e) {
    // Column might already exist
  }

  // 2. Seed Multiple Demo Users
  const demoUsers = [
    // LAWYERS
    {
      id: '1',
      name: 'Advocate Ananya Sharma',
      email: 'ananya.lawyer@justiceflow.demo',
      passwords: ['lawyer123', 'JusticeFlow@123'],
      role: 'LAWYER',
      district: 'Central Delhi',
      profile: {
        practice_area: 'Criminal Law & Bail Defense',
        languages: 'English • Hindi',
        district: 'Central Delhi',
        current_workload: 'Low',
        enrollment: 'D/1420/2016',
        phone: '+91 98765 10001'
      }
    },
    {
      id: '2',
      name: 'Advocate Rahul Verma',
      email: 'rahul.lawyer@justiceflow.demo',
      passwords: ['lawyer123', 'JusticeFlow@123'],
      role: 'LAWYER',
      district: 'Vellore',
      profile: {
        practice_area: 'Criminal Law',
        languages: 'English • Hindi',
        district: 'Vellore',
        current_workload: 'Medium',
        enrollment: 'D/2105/2014',
        phone: '+91 98765 10002'
      }
    },
    {
      id: '3',
      name: 'Advocate Priya Menon',
      email: 'priya.lawyer@justiceflow.demo',
      passwords: ['lawyer123', 'JusticeFlow@123'],
      role: 'LAWYER',
      district: 'Chennai',
      profile: {
        practice_area: 'Criminal Law & Statutory Appeals',
        languages: 'English • Tamil',
        district: 'Chennai',
        current_workload: 'Low',
        enrollment: 'D/0882/2018',
        phone: '+91 98765 10003'
      }
    },
    // Backward-compatible lawyer
    {
      id: 'LAWYER-001',
      name: 'Adv. Rajesh Kumar',
      email: 'lawyer@justiceflow.demo',
      passwords: ['lawyer123', 'JusticeFlow@123'],
      role: 'LAWYER',
      district: 'Central Delhi',
      profile: {
        practice_area: 'Legal-Aid Duty Counsel',
        languages: 'English • Hindi',
        district: 'Central Delhi',
        current_workload: 'Low',
        enrollment: 'D/3419/2019',
        phone: '+91 98765 10000'
      }
    },

    // POLICE OFFICERS
    {
      id: '4',
      name: 'Officer Arjun Kumar',
      email: 'arjun.police@justiceflow.demo',
      passwords: ['police123', 'JusticeFlow@123'],
      role: 'POLICE',
      district: 'Central Delhi',
    },
    {
      id: '5',
      name: 'Officer Kavya Singh',
      email: 'kavya.police@justiceflow.demo',
      passwords: ['police123', 'JusticeFlow@123'],
      role: 'POLICE',
      district: 'South Delhi',
    },
    {
      id: '6',
      name: 'Officer Ravi Kumar',
      email: 'ravi.police@justiceflow.demo',
      passwords: ['police123', 'JusticeFlow@123'],
      role: 'POLICE',
      district: 'Vellore',
    },
    // Backward-compatible police
    {
      id: 'POLICE-001',
      name: 'Inspector Vikram Sharma',
      email: 'police@justiceflow.demo',
      passwords: ['police123', 'JusticeFlow@123'],
      role: 'POLICE',
      district: 'Central Delhi',
    },

    // FAMILY MEMBERS
    {
      id: '7',
      name: 'Ramesh Kumar',
      email: 'ramesh.family@justiceflow.demo',
      passwords: ['family123', 'JusticeFlow@123'],
      role: 'FAMILY_MEMBER',
      district: 'Central Delhi',
    },
    {
      id: '8',
      name: 'Sunita Devi',
      email: 'sunita.family@justiceflow.demo',
      passwords: ['family123', 'JusticeFlow@123'],
      role: 'FAMILY_MEMBER',
      district: 'South Delhi',
    },
    {
      id: '9',
      name: 'Meena Raj',
      email: 'meena.family@justiceflow.demo',
      passwords: ['family123', 'JusticeFlow@123'],
      role: 'FAMILY_MEMBER',
      district: 'Vellore',
    },
    // Backward-compatible family
    {
      id: 'FAMILY-001',
      name: 'Smt. Geeta Devi',
      email: 'family@justiceflow.demo',
      passwords: ['family123', 'JusticeFlow@123'],
      role: 'FAMILY_MEMBER',
      district: 'Central Delhi',
    },
  ];

  for (const u of demoUsers) {
    const existing = await get('SELECT id FROM users WHERE lower(email) = lower(?)', [u.email]);
    const hash = hashPassword(u.passwords[0]);
    if (!existing) {
      await run(
        `INSERT INTO users (id, name, email, password_hash, role, district)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [u.id, u.name, u.email, hash, u.role, u.district]
      );
    } else {
      await run(
        `UPDATE users SET id = ?, password_hash = ?, role = ?, name = ?, district = ? WHERE lower(email) = lower(?)`,
        [u.id, hash, u.role, u.name, u.district, u.email]
      );
    }

    // Insert or update lawyer_profiles if user is a lawyer
    if (u.profile) {
      const existingProf = await get('SELECT id FROM lawyer_profiles WHERE user_id = ?', [u.id]);
      if (!existingProf) {
        await run(
          `INSERT INTO lawyer_profiles (user_id, practice_area, languages, district, legal_aid_available, availability_status, current_workload, enrollment_number, phone)
           VALUES (?, ?, ?, ?, 1, 'AVAILABLE', ?, ?, ?)`,
          [u.id, u.profile.practice_area, u.profile.languages, u.profile.district, u.profile.current_workload, u.profile.enrollment, u.profile.phone]
        );
      } else {
        await run(
          `UPDATE lawyer_profiles 
           SET practice_area = ?, languages = ?, district = ?, current_workload = ?, enrollment_number = ?, phone = ?
           WHERE user_id = ?`,
          [u.profile.practice_area, u.profile.languages, u.profile.district, u.profile.current_workload, u.profile.enrollment, u.profile.phone, u.id]
        );
      }

      // Also ensure legacy lawyers table contains this record with same id
      const existingLegacy = await get('SELECT id FROM lawyers WHERE id = ?', [u.id]);
      if (!existingLegacy) {
        await run(
          `INSERT INTO lawyers (id, name, email, practice_area, languages, district, legal_aid_available, availability_status, current_workload, enrollment_number, phone)
           VALUES (?, ?, ?, ?, ?, ?, 1, 'AVAILABLE', ?, ?, ?)`,
          [u.id, u.name, u.email, u.profile.practice_area, u.profile.languages, u.profile.district, u.profile.current_workload, u.profile.enrollment, u.profile.phone]
        );
      }
    }
  }

  // 3. Seed Review 2 Demo Cases (JF-1001, JF-1002, JF-1003, JF-1024, JF-1027)
  const review2Cases = [
    {
      case_number: 'JF-1001',
      prisoner_name: 'Ramesh Kumar (Demo)',
      section: '115(2)', // Voluntarily causing hurt, max 1 year = 365 days, threshold = 182 days
      custody_start_date: '2025-09-01',
      delay_days: 0,
      first_time: 0,
      multiple: 0,
      fir_number: 'FIR-2025-0101',
      district: 'Central Delhi',
      court: 'Sessions Court, Tis Hazari',
      lawyer: 'Advocate Ananya Sharma',
      verification_status: 'PENDING_VERIFICATION',
      created_by: '4',
      created_by_role: 'POLICE'
    },
    {
      case_number: 'JF-1002',
      prisoner_name: 'Priya Sharma (Demo)',
      section: '115(2)',
      custody_start_date: '2025-10-15',
      delay_days: 0,
      first_time: 0,
      multiple: 0,
      fir_number: 'FIR-2025-0102',
      district: 'South Delhi',
      court: 'CMM Court, Saket',
      lawyer: 'Advocate Rahul Verma',
      verification_status: 'PENDING_VERIFICATION',
      created_by: '5',
      created_by_role: 'POLICE'
    },
    {
      case_number: 'JF-1003',
      prisoner_name: 'Amit Singh (Demo)',
      section: '115(2)',
      custody_start_date: '2026-02-01',
      delay_days: 0,
      first_time: 0,
      multiple: 0,
      fir_number: 'FIR-2026-0089',
      district: 'East Delhi',
      court: 'Sessions Court, KKD',
      lawyer: 'Advocate Priya Menon',
      verification_status: 'PENDING_VERIFICATION',
      created_by: '4',
      created_by_role: 'POLICE'
    },
    {
      case_number: 'JF-1024',
      prisoner_name: 'Suresh Patel (Demo)',
      section: '115(2)',
      custody_start_date: '2025-08-15',
      delay_days: 0,
      first_time: 0,
      multiple: 0,
      fir_number: 'FIR-2025-0556',
      district: 'Vellore',
      court: 'Sessions Court, Vellore',
      lawyer: 'Advocate Rahul Verma',
      verification_status: 'PENDING_VERIFICATION',
      created_by: '6',
      created_by_role: 'POLICE'
    },
    {
      case_number: 'JF-1027',
      prisoner_name: 'Deepak Verma (Demo)',
      section: '115(2)',
      custody_start_date: '2025-10-20',
      delay_days: 0,
      first_time: 0,
      multiple: 0,
      fir_number: 'FIR-2025-0789',
      district: 'South-West Delhi',
      court: 'CMM Court, Dwarka',
      lawyer: 'Advocate Ananya Sharma',
      verification_status: 'VERIFIED',
      verified_by: 'Officer Arjun Kumar',
      verified_at: '2026-09-18 10:30:00',
      created_by: '4',
      created_by_role: 'POLICE'
    }
  ];

  for (const c of review2Cases) {
    const existing = await get('SELECT id FROM cases WHERE case_number = ?', [c.case_number]);
    const offence = await get('SELECT * FROM offences WHERE section = ?', [c.section]);
    if (!offence) continue;

    const caseData = {
      custodyStartDate: c.custody_start_date,
      delayDays: c.delay_days,
      firstTimeOffender: c.first_time === 1,
      multiplePendingCases: c.multiple === 1,
    };

    const result = calculateEligibility(caseData, offence);

    if (!existing) {
      await run(
        `INSERT INTO cases (
          case_number, prisoner_name, fir_number, district, court, lawyer,
          offence_id, custody_start_date, delay_days, first_time_offender, multiple_pending_cases,
          eligibility_status, eligibility_result, verification_status, verified_by, verified_at,
          created_by, created_by_role
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          JSON.stringify(result),
          c.verification_status,
          c.verified_by || null,
          c.verified_at || null,
          c.created_by || null,
          c.created_by_role || null
        ]
      );
    }
  }

  // 4. Seed Initial Legal-Aid Requests assigned to specific real lawyer user IDs
  const initialRequests = [
    {
      request_id: 'REQ-2026-001',
      case_number: 'JF-1024',
      family_member_id: '7',
      family_member_name: 'Ramesh Kumar',
      family_member_phone: '+91 98765 11223',
      lawyer_id: '2', // Advocate Rahul Verma (User ID 2)
      lawyer_name: 'Advocate Rahul Verma',
      status: 'PENDING',
      priority_level: 'HIGH_ATTENTION',
      priority_reasons: JSON.stringify([
        'Threshold reached ✓',
        '33 days beyond configured threshold ✓',
        'Long custody duration (215 days) ✓',
        'Request awaiting review (2 days) ✓'
      ]),
      request_age_days: 2,
      created_at: '2026-09-17 14:20:00'
    },
    {
      request_id: 'REQ-2026-002',
      case_number: 'JF-1001',
      family_member_id: '7',
      family_member_name: 'Ramesh Kumar',
      family_member_phone: '+91 98765 11223',
      lawyer_id: '1', // Advocate Ananya Sharma (User ID 1)
      lawyer_name: 'Advocate Ananya Sharma',
      status: 'PENDING',
      priority_level: 'HIGH_ATTENTION',
      priority_reasons: JSON.stringify([
        'Threshold reached ✓',
        '18 days beyond configured threshold ✓',
        'Request awaiting review (1 day) ✓'
      ]),
      request_age_days: 1,
      created_at: '2026-09-18 09:15:00'
    },
    {
      request_id: 'REQ-2026-003',
      case_number: 'JF-1027',
      family_member_id: '8',
      family_member_name: 'Sunita Devi',
      family_member_phone: '+91 98765 44332',
      lawyer_id: '3', // Advocate Priya Menon (User ID 3)
      lawyer_name: 'Advocate Priya Menon',
      status: 'UNDER_REVIEW',
      priority_level: 'APPROACHING',
      priority_reasons: JSON.stringify([
        'Approaching threshold (32 days remaining)',
        'Request received today'
      ]),
      request_age_days: 0,
      created_at: '2026-09-19 08:30:00'
    }
  ];

  for (const r of initialRequests) {
    const existing = await get('SELECT id FROM legal_aid_requests WHERE request_id = ?', [r.request_id]);
    if (!existing) {
      const caseRow = await get('SELECT * FROM cases WHERE case_number = ?', [r.case_number]);
      const offence = caseRow ? await get('SELECT * FROM offences WHERE id = ?', [caseRow.offence_id]) : null;
      const elResult = caseRow?.eligibility_result ? JSON.parse(caseRow.eligibility_result) : {};

      await run(
        `INSERT INTO legal_aid_requests (
          request_id, case_id, case_number, prisoner_name, offence_name,
          custody_duration_days, configured_threshold_days, days_beyond_threshold,
          family_member_id, family_member_name, family_member_phone,
          lawyer_id, lawyer_name, status, priority_level, priority_reasons, request_age_days, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          r.request_id,
          caseRow ? caseRow.id : 1,
          r.case_number,
          caseRow ? caseRow.prisoner_name : 'Demo Prisoner',
          offence ? `${offence.section} ${offence.law_code} (${offence.offence_name})` : 'Under configured section',
          elResult.creditedDetentionDays || 200,
          elResult.thresholdDays || 180,
          elResult.daysOverThreshold || 20,
          r.family_member_id,
          r.family_member_name,
          r.family_member_phone,
          r.lawyer_id,
          r.lawyer_name,
          r.status,
          r.priority_level,
          r.priority_reasons,
          r.request_age_days,
          'Seeded test request for priority queue',
          r.created_at,
          r.created_at
        ]
      );
    }
  }

  console.log('Multiple demo users, lawyer_profiles, and Review 2 data initialized successfully.');
}

module.exports = { initReview2 };
