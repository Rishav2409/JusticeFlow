const { exec, run, all } = require('./db');

const offences = [
  {
    law_code: 'BNS',
    section: '303(2)',
    offence_name: 'Theft',
    max_years: 3,
    max_days: 0,
    death_or_life: 0
  },
  {
    law_code: 'BNS',
    section: '304(2)',
    offence_name: 'Snatching',
    max_years: 3,
    max_days: 0,
    death_or_life: 0
  },
  {
    law_code: 'BNS',
    section: '305',
    offence_name: 'Theft in dwelling house / transport / place of worship etc.',
    max_years: 7,
    max_days: 0,
    death_or_life: 0
  },
  {
    law_code: 'BNS',
    section: '306',
    offence_name: 'Theft by clerk or servant',
    max_years: 7,
    max_days: 0,
    death_or_life: 0
  },
  {
    law_code: 'BNS',
    section: '316(2)',
    offence_name: 'Criminal breach of trust',
    max_years: 5,
    max_days: 0,
    death_or_life: 0
  },
  {
    law_code: 'BNS',
    section: '318(2)',
    offence_name: 'Cheating',
    max_years: 3,
    max_days: 0,
    death_or_life: 0
  },
  {
    law_code: 'BNS',
    section: '318(4)',
    offence_name: 'Cheating and dishonestly inducing delivery of property',
    max_years: 7,
    max_days: 0,
    death_or_life: 0
  },
  {
    law_code: 'BNS',
    section: '329(3)',
    offence_name: 'Criminal trespass',
    max_years: 0,
    max_days: 90,
    death_or_life: 0
  },
  {
    law_code: 'BNS',
    section: '351(2)',
    offence_name: 'Criminal intimidation',
    max_years: 2,
    max_days: 0,
    death_or_life: 0
  },
  {
    law_code: 'BNS',
    section: '132',
    offence_name: 'Assault or criminal force to deter public servant',
    max_years: 2,
    max_days: 0,
    death_or_life: 0
  },
  {
    law_code: 'BNS',
    section: '121(1)',
    offence_name: 'Voluntarily causing hurt to deter public servant',
    max_years: 5,
    max_days: 0,
    death_or_life: 0
  },
  {
    law_code: 'BNS',
    section: '103(1)',
    offence_name: 'Murder',
    max_years: 0,
    max_days: 0,
    death_or_life: 1
  }
];

const SOURCE_REF =
  'Government of India — Bharatiya Nyaya Sanhita, 2023 (India Code / BPRD), verified statutory punishment values.';

async function seedOffences() {
  try {
    await exec('DELETE FROM offences');

    for (const off of offences) {
      await run(
        `INSERT INTO offences
        (
          law_code,
          section,
          offence_name,
          max_imprisonment_years,
          max_imprisonment_days,
          death_or_life_exclusion,
          source_reference
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          off.law_code,
          off.section,
          off.offence_name,
          off.max_years,
          off.max_days,
          off.death_or_life,
          SOURCE_REF
        ]
      );
    }

    const rows = await all('SELECT * FROM offences');

    console.log(`Successfully seeded ${rows.length} verified BNS offences.`);

    rows.forEach(r => {
      console.log(
        `[${r.id}] ${r.law_code} Sec ${r.section} - ${r.offence_name}`
      );
    });

  } catch (error) {
    console.error('Error seeding offences:', error);
  }
}

seedOffences();