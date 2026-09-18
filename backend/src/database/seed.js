const { exec, run, all } = require('./db');

const offences = [
  { law_code: 'BNS', section: '303(2)', offence_name: 'Theft', max_years: 3, max_days: 0, death_or_life: 0 },
  { law_code: 'BNS', section: '309(2)', offence_name: 'Criminal breach of trust', max_years: 3, max_days: 0, death_or_life: 0 },
  { law_code: 'BNS', section: '318(4)', offence_name: 'Cheating', max_years: 3, max_days: 0, death_or_life: 0 },
  { law_code: 'BNS', section: '115(2)', offence_name: 'Voluntarily causing hurt', max_years: 1, max_days: 0, death_or_life: 0 },
  { law_code: 'BNS', section: '121(1)', offence_name: 'Voluntarily causing grievous hurt', max_years: 7, max_days: 0, death_or_life: 0 },
  { law_code: 'BNS', section: '329', offence_name: 'Criminal trespass', max_years: 3, max_days: 0, death_or_life: 0 },
  { law_code: 'BNS', section: '351(2)', offence_name: 'Criminal intimidation', max_years: 2, max_days: 0, death_or_life: 0 },
  { law_code: 'BNS', section: '74(1)', offence_name: 'Assault on public servant', max_years: 3, max_days: 0, death_or_life: 0 },
  { law_code: 'BNS', section: '303(1)', offence_name: 'Robbery', max_years: 10, max_days: 0, death_or_life: 0 },
  { law_code: 'BNS', section: '103(1)', offence_name: 'Murder', max_years: 0, max_days: 0, death_or_life: 1 },
  { law_code: 'BNS', section: '64', offence_name: 'Kidnapping', max_years: 7, max_days: 0, death_or_life: 0 },
  { law_code: 'BNS', section: '275', offence_name: 'Counterfeiting currency', max_years: 10, max_days: 0, death_or_life: 0 },
];

const SOURCE_REF = 'MOCK DATA — for demonstration only. Must be replaced with verified statutory values before any real-world use.';

async function seedOffences() {
  try {
    await exec('DELETE FROM offences');

    for (const off of offences) {
      await run(
        `INSERT INTO offences (law_code, section, offence_name, max_imprisonment_years, max_imprisonment_days, death_or_life_exclusion, source_reference)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [off.law_code, off.section, off.offence_name, off.max_years, off.max_days, off.death_or_life, SOURCE_REF]
      );
    }

    const rows = await all('SELECT * FROM offences');
    console.log(`Successfully seeded ${rows.length} offences.`);
    rows.forEach(r => console.log(`  [${r.id}] ${r.law_code} Sec ${r.section} - ${r.offence_name} (max: ${r.max_imprisonment_years}yr${r.death_or_life_exclusion ? ' | DEATH/LIFE' : ''})`));
  } catch (error) {
    console.error('Error seeding offences:', error);
  }
}

seedOffences();
