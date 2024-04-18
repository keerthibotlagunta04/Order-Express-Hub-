const express = require("express");
const router = express.Router();
const { getDatabaseInstance } = require("../OrderExpressHub-DataBase");

router.get("/categories/:id", (req, res) => {
  const { id } = req.params;
  const db = getDatabaseInstance(req.schema_name);
  db.get("SELECT * FROM menu_category WHERE id = ?", [id], (error, category) => {
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }
    res.json(category);
  });
});

router.get("/categories", (req, res) => {
  const db = getDatabaseInstance(req.schema_name);
  db.all("SELECT * FROM menu_category", (error, categories) => {
    if (error) {
      res.status(500).json({ message: error.message });
    } else {
      res.json(categories);
    }
  });
});

router.post("/category/new", (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }
  const db = getDatabaseInstance(req.schema_name);
  db.run("INSERT INTO menu_category (name) VALUES (?)", [name], function (error) {
    if (error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(201).json({ message: "Category successfully created", id: this.lastID });
    }
  });
});

router.put("/category/:id", (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }
  const db = getDatabaseInstance(req.schema_name);
  db.run("UPDATE menu_category SET name = ? WHERE id = ?", [name, id], (error) => {
    if (error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(200).json({ message: "Category successfully updated" });
    }
  });
});

router.delete("/category/:id", (req, res) => {
  const { id } = req.params;
  const db = getDatabaseInstance(req.schema_name);
  db.run("DELETE FROM menu_category WHERE id = ?", [id], (error) => {
    if (error) {
      res.status(500).json({ message: "Cannot delete this category, items exist" });
    } else {
      res.status(200).json({ message: "Category successfully deleted" });
    }
  });
});

router.get("/plain", (req, res) => {
  const db = getDatabaseInstance(req.schema_name);
  db.all(
    `
    SELECT mi.id, mi.name, mi.description, mi.price, mi.category_id, mc.name as category_name
    FROM menu_item mi
    JOIN menu_category mc ON mi.category_id = mc.id
    ORDER BY mi.category_id
  `,
    (err, rows) => {
      if (err) {
        res.status(500).json({ message: err.message });
      } else {
        res.json(rows);
      }
    }
  );
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  const db = getDatabaseInstance(req.schema_name);
  db.get(
    `
    SELECT mi.id, mi.name, mi.description, mi.price, mi.category_id, mc.name as category_name
    FROM menu_item mi
    JOIN menu_category mc ON mi.category_id = mc.id
    WHERE mi.id = ?
    `,
    [id],
    (error, item) => {
      if (error) {
        res.status(500).json({ message: error.message });
      } else if (!item) {
        res.status(404).json({ message: "Menu item not found" });
      } else {
        res.json(item);
      }
    }
  );
});

router.get("/", (req, res) => {
  const db = getDatabaseInstance(req.schema_name);
  db.all(
    `
    SELECT mi.id, mi.name, mi.description, mi.price, mi.category_id, mc.name as category_name
    FROM menu_item mi
    JOIN menu_category mc ON mi.category_id = mc.id
    ORDER BY mi.category_id
  `,
    (error, rows) => {
      if (error) {
        res.status(500).json({ message: error.message });
      } else {
        const itemsByCategory = rows.reduce((acc, item) => {
          const categoryName = item.category_name;
          if (!acc[categoryName]) {
            acc[categoryName] = [];
          }
          acc[categoryName].push({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            category_id: item.category_id,
          });
          return acc;
        }, {});
        res.json(itemsByCategory);
      }
    }
  );
});

router.post("/new", (req, res) => {
  const { name, description, price, category_id } = req.body;
  if (!name || price == null || !category_id) {
    return res.status(400).json({ message: "Name, price, and category ID are required" });
  }
  const db = getDatabaseInstance(req.schema_name);
  db.run(
    "INSERT INTO menu_item (name, description, price, category_id) VALUES (?, ?, ?, ?)",
    [name, description, price, category_id],
    function (error) {
      if (error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(201).json({ message: "Item successfully created", id: this.lastID });
      }
    }
  );
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, description, price, category_id } = req.body;
  if (!name || price == null || !category_id) {
    return res.status(400).json({ message: "Name, price, and category ID are required" });
  }
  const db = getDatabaseInstance(req.schema_name);
  db.run(
    "UPDATE menu_item SET name = ?, description = ?, price = ?, category_id = ? WHERE id = ?",
    [name, description, price, category_id, id],
    (error) => {
      if (error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(200).json({ message: "Item successfully updated" });
      }
    }
  );
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const db = getDatabaseInstance(req.schema_name);
  db.run("DELETE FROM menu_item WHERE id = ?", [id], (error) => {
    if (error) {
      res.status(500).json({ message: "Cannot delete this Item, Orders Exist" });
    } else {
      res.status(200).json({ message: "Item successfully deleted" });
    }
  });
});

module.exports = router;
