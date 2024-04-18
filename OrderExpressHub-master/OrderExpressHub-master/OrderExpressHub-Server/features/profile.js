const express = require("express");
const router = express.Router();
const { getDatabaseInstance } = require("../OrderExpressHub-DataBase");
const bcrypt = require("bcrypt");

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

router.post("/new", async (req, res) => {
  const db = getDatabaseInstance("./Group3_OrderExpressHub.sqlite");
  const { email, password, role } = req.body;
  const org_id = req.org_id;

  if (req.role !== "manager") {
    return res.status(403).send({ message: "Only managers can create additional users." });
  }

  try {
    const encrypted_password = await hash(password);
    let userExists = await new Promise((resolve, reject) => {
      db.get(`SELECT id FROM users WHERE email = ?`, [email], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(row.id);
        } else {
          resolve(null);
        }
      });
    });

    if (userExists) {
      db.run(`INSERT INTO user_orgs (org_id, user_id, role) VALUES (?, ?, ?)`, [org_id, userExists, role], (err) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: "Existing user added to organization successfully." });
      });
    } else {
      db.run(`INSERT INTO users (email, password) VALUES (?, ?)`, [email, encrypted_password], function (err) {
        if (err) {
          console.error("Error creating user:", err);
          return res.status(500).json({ error: err.message });
        }
        const newUser_id = this.lastID;
        db.run(`INSERT INTO user_orgs (org_id, user_id, role) VALUES (?, ?, ?)`, [org_id, newUser_id, role], (err) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: err.message });
          }
          res.status(200).json({ message: "New user created and added to organization successfully." });
        });
      });
    }
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  const db = getDatabaseInstance("./Group3_OrderExpressHub.sqlite");
  const org_db = getDatabaseInstance(req.schema_name);
  const table_names = {
    manager: "manager",
    kitchenporter: "kitchen_porter",
    foodrunner: "food_runner",
    chef: "chef",
    waitstaff: "waitstaff",
  };

  db.get("SELECT email FROM users WHERE id = ?", [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Internal server error." });
    } else if (!result) {
      return res.status(404).json({ error: "User not found." });
    }
    org_db.get(`SELECT * FROM ${table_names[req.role]} WHERE id = ?`, [id], (err, userResult) => {
      if (err) {
        return res.status(500).json({ error: "Internal server error." });
      }
      res.json({ ...result, ...userResult });
    });
  });
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { full_name, phone_number, address, kitchen_area_id } = req.body;
  const org_db = getDatabaseInstance(req.schema_name);

  const table_names = {
    manager: "manager",
    kitchenporter: "kitchen_porter",
    foodrunner: "food_runner",
    chef: "chef",
    waitstaff: "waitstaff",
  };

  const updateQuery = `
    UPDATE ${table_names[req.role]}
    SET full_name = ?, phone_number = ?, address = ?
    ${req.role !== "waitstaff" && req.role !== "manager" ? ", kitchen_area_id = ?" : ""}
    WHERE id = ?
  `;

  const params =
    req.role !== "waitstaff" && req.role !== "manager"
      ? [full_name, phone_number, address, kitchen_area_id, id]
      : [full_name, phone_number, address, id];

  org_db.run(updateQuery, params, function (err) {
    if (err) {
      return res.status(500).json({ error: "Internal server error." });
    } else if (this.changes === 0) {
      const insertQuery = `
        INSERT INTO ${table_names[req.role]} (full_name, phone_number, address${
        req.role !== "waitstaff" && req.role !== "manager" ? ", kitchen_area_id" : ""
      }, id)
        VALUES (?, ?, ?, ?${req.role !== "waitstaff" && req.role !== "manager" ? ", ?" : ""})
      `;

      org_db.run(insertQuery, params, (insertErr) => {
        if (insertErr) {
          return res.status(500).json({ error: "Failed to insert new record." });
        }
        res.json({ message: "Successfully inserted new record." });
      });
    } else {
      res.json({ message: "Successfully updated." });
    }
  });
});

module.exports = router;
