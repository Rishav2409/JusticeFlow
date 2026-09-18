-- NyayaFlow Database Schema
-- SQLite

CREATE TABLE IF NOT EXISTS offences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  law_code TEXT NOT NULL,
  section TEXT NOT NULL,
  offence_name TEXT NOT NULL,
  max_imprisonment_years INTEGER NOT NULL DEFAULT 0,
  max_imprisonment_days INTEGER NOT NULL DEFAULT 0,
  death_or_life_exclusion INTEGER NOT NULL DEFAULT 0,
  source_reference TEXT NOT NULL DEFAULT 'MOCK DATA - for demonstration only'
);

CREATE TABLE IF NOT EXISTS cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_number TEXT UNIQUE NOT NULL,
  prisoner_name TEXT NOT NULL,
  fir_number TEXT,
  district TEXT,
  court TEXT,
  lawyer TEXT,
  offence_id INTEGER NOT NULL,
  custody_start_date TEXT NOT NULL,
  delay_days INTEGER NOT NULL DEFAULT 0,
  first_time_offender INTEGER NOT NULL DEFAULT 0,
  multiple_pending_cases INTEGER NOT NULL DEFAULT 0,
  eligibility_status TEXT,
  eligibility_result TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (offence_id) REFERENCES offences(id)
);
