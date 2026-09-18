const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', '..', 'data', 'nyayaflow.db');
const schemaPath = path.join(__dirname, '..', '..', '..', 'database', 'schema.sql');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db = null;
let dbReady = null;

// Save database to disk
function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

// Initialize database (async, but cached)
async function getDb() {
  if (db) return db;
  if (dbReady) return dbReady;

  dbReady = (async () => {
    const SQL = await initSqlJs();

    // Load existing database or create new one
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }

    // Run schema
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.run(schema);
    saveDb();

    return db;
  })();

  return dbReady;
}

// Helper: run a query that returns rows (SELECT)
async function all(sql, params = []) {
  const database = await getDb();
  const stmt = database.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

// Helper: run a query that returns one row
async function get(sql, params = []) {
  const database = await getDb();
  const stmt = database.prepare(sql);
  stmt.bind(params);
  let row = null;
  if (stmt.step()) {
    row = stmt.getAsObject();
  }
  stmt.free();
  return row;
}

// Helper: run a query that modifies data (INSERT, UPDATE, DELETE)
async function run(sql, params = []) {
  const database = await getDb();
  database.run(sql, params);
  saveDb();
  const lastId = database.exec("SELECT last_insert_rowid() as id");
  const changes = database.getRowsModified();
  return {
    lastInsertRowid: lastId.length > 0 ? lastId[0].values[0][0] : 0,
    changes
  };
}

// Helper: execute raw SQL (for schema, etc.)
async function exec(sql) {
  const database = await getDb();
  database.run(sql);
  saveDb();
}

module.exports = { getDb, all, get, run, exec, saveDb };
