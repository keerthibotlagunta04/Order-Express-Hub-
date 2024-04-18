const express = require("express");
const router = express.Router();
const { getDatabaseInstance } = require("../OrderExpressHub-DataBase");

router.get("/:id", (req, res) => {
  const { id } = req.params;
  const db = getDatabaseInstance(req.schema_name);
  db.get("SELECT * FROM kitchen_area WHERE id = ?", [id], (error, kitchenArea) => {
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    if (!kitchenArea) {
      res.status(404).json({ message: "Kitchen area not found" });
      return;
    }
    res.json(kitchenArea);
  });
});

router.get("/", (req, res) => {
  const db = getDatabaseInstance(req.schema_name);
  db.all("SELECT * FROM kitchen_area", (error, kitchenAreas) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.json(kitchenAreas);
    }
  });
});

router.post("/new", (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }
  const db = getDatabaseInstance(req.schema_name);
  db.run("INSERT INTO kitchen_area (name, description) VALUES (?, ?)", [name, description || ""], function (error) {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(201).json({ id: this.lastID, message: "Kitchen area created successfully" });
    }
  });
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }
  const db = getDatabaseInstance(req.schema_name);
  db.run("UPDATE kitchen_area SET name = ?, description = ? WHERE id = ?", [name, description, id], (error) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(200).json({ message: "Updated kitchen area successfully" });
    }
  });
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const db = getDatabaseInstance(req.schema_name);
  db.run("DELETE FROM kitchen_area WHERE id = ?", [id], (error) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(200).json({ message: "Deleted kitchen area successfully" });
    }
  });
});

module.exports = router;
