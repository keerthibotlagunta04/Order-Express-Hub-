const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { getDatabaseInstance } = require("../OrderExpressHub-DataBase");

async function hash(plain) {
  const salt = 10;
  try {
    const hash = await bcrypt.hash(plain, salt);
    return hash;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
}

router.post("/", async (req, res) => {
  const { email, password, org_name } = req.body;
  let org_id = 0;
  try {
    let encrypted_password = await hash(password);
    let db = getDatabaseInstance("./Group3_OrderExpressHub.sqlite");

    const result = await new Promise((resolve, reject) => {
      db.get(`SELECT id FROM organizations WHERE name = ?`, [org_name], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve({ exists: true, id: row.id });
        } else {
          db.run(`INSERT INTO organizations (name) VALUES (?)`, [org_name], function (err) {
            if (err) {
              reject(err);
            } else {
              resolve({ exists: false, id: this.lastID });
            }
          });
        }
      });
    });

    if (result.exists) {
      res.status(409).json({ message: "Organization already exists." });
      return;
    }
    org_id = result.id;

    const user_id = await new Promise((resolve, reject) => {
      db.run(`INSERT INTO users (email, password) VALUES (?, ?)`, [email, encrypted_password], function (err) {
        if (err) {
          reject(err);
        } else resolve(this.lastID);
      });
    });

    db.run(`INSERT INTO user_orgs (org_id, user_id, role) VALUES (?, ?, ?)`, [org_id, user_id, "manager"], (err) => {
      if (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: err.message });
        return;
      }
      createOrgTables(org_id, org_name);
      res.status(200).json({ message: "Org Created Successfully" });
    });
  } catch (e) {
    if (e.message === "SQLITE_CONSTRAINT: UNIQUE constraint failed: users.email") {
      db.run(`DELETE FROM organizations WHERE id = ?`, [org_id]);
      res.status(500).json({ message: "Email is already in use" });
    } else {
      res.status(500).json({ error: e.message });
    }
  }
});

const createOrgTables = (org_id, org_name) => {
  const org_db = getDatabaseInstance(org_id + "_" + org_name + ".sqlite");

  table_creation_queries = {
    menu_category: `CREATE TABLE IF NOT EXISTS menu_category (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT NOT NULL UNIQUE
                  );`,
    menu_item: `CREATE TABLE IF NOT EXISTS menu_item (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          price REAL,
          category_id INTEGER NOT NULL,
          FOREIGN KEY (category_id) REFERENCES menu_category(id) ON DELETE CASCADE
        );`,
    menu: `CREATE TABLE IF NOT EXISTS menu (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          active INTEGER NOT NULL CHECK (active IN (0, 1))
        );`,
    menu_menu_item: `CREATE TABLE IF NOT EXISTS menu_menu_item (
                    menu_id INTEGER NOT NULL,
                    menu_item_id INTEGER NOT NULL,
                    PRIMARY KEY (menu_id, menu_item_id),
                    FOREIGN KEY (menu_id) REFERENCES menu(id) ON DELETE CASCADE,
                    FOREIGN KEY (menu_item_id) REFERENCES menu_item(id) ON DELETE CASCADE
                  );`,
    kitchen_area: `CREATE TABLE IF NOT EXISTS kitchen_area (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT
                  );`,
    order: `CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME NOT NULL,
            status TEXT NOT NULL,
            priority INTEGER NOT NULL,
            total_amount REAL NOT NULL,
            table_number INTEGER NOT NULL,
            kitchen_area_id INTEGER NOT NULL,
            FOREIGN KEY (kitchen_area_id) REFERENCES kitchen_area(id) ON DELETE CASCADE
          );`,
    order_items: `CREATE TABLE IF NOT EXISTS order_items (
                  order_id INTEGER NOT NULL,
                  item_id INTEGER NOT NULL,
                  quantity INTEGER NOT NULL,
                  notes TEXT,
                  PRIMARY KEY (order_id, item_id),
                  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                  FOREIGN KEY (item_id) REFERENCES menu_item(id) ON DELETE CASCADE
                );`,
    daily_report: `CREATE TABLE IF NOT EXISTS daily_report (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  date DATE NOT NULL,
                  total_sales REAL NOT NULL,
                  order_count INTEGER NOT NULL
                );`,
    extra_ingredients: `CREATE TABLE IF NOT EXISTS extra_ingredients (
                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                      name TEXT NOT NULL,
                      description TEXT,
                      price REAL NOT NULL
                    );`,
    manager: `CREATE TABLE IF NOT EXISTS manager (
              id INTEGER PRIMARY KEY,
              full_name TEXT NOT NULL,
              phone_number TEXT,
              address TEXT
            );`,
    waitstaff: `CREATE TABLE IF NOT EXISTS waitstaff (
              id INTEGER PRIMARY KEY,
              full_name TEXT NOT NULL,
              phone_number TEXT,
              address TEXT
            );`,
    chef: `CREATE TABLE IF NOT EXISTS chef (
          id INTEGER PRIMARY KEY,
          full_name TEXT NOT NULL,
          phone_number TEXT,
          address TEXT,
          kitchen_area_id INTEGER,
          FOREIGN KEY (kitchen_area_id) REFERENCES kitchen_area(id) ON DELETE CASCADE
        );`,
    kitchen_porter: `CREATE TABLE IF NOT EXISTS kitchen_porter (
          id INTEGER PRIMARY KEY,
          full_name TEXT NOT NULL,
          phone_number TEXT,
          address TEXT,
          kitchen_area_id INTEGER,
          FOREIGN KEY (kitchen_area_id) REFERENCES kitchen_area(id) ON DELETE CASCADE
        );`,
    food_runner: `CREATE TABLE IF NOT EXISTS food_runner (
          id INTEGER PRIMARY KEY,
          full_name TEXT NOT NULL,
          phone_number TEXT,
          address TEXT,
          kitchen_area_id INTEGER,
          FOREIGN KEY (kitchen_area_id) REFERENCES kitchen_area(id) ON DELETE CASCADE
        );`,
  };
  Object.values(table_creation_queries).forEach((sql) => {
    org_db.run(sql, [], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
    });
  });

  org_db.close();
};

module.exports = router;
