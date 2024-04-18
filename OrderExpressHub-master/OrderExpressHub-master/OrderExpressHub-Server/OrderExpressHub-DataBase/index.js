const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const getDatabaseInstance = (dbPath) => {
  const fullPath = path.resolve(__dirname, dbPath);
  const db = new sqlite3.Database(fullPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      console.error(err.message);
      throw err;
    }
  });
  db.exec("PRAGMA foreign_keys = ON;");
  return db;
};

const initDatabase = () => {
  db = getDatabaseInstance("./Group3_OrderExpressHub.sqlite");
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS organizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS user_orgs (
          org_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          role TEXT NOT NULL,
          PRIMARY KEY (org_id, user_id),
          FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )`);
  });
};

module.exports = { getDatabaseInstance, initDatabase };
