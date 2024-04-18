const express = require("express");
const router = express.Router();
const { getDatabaseInstance } = require("../OrderExpressHub-DataBase");

router.get("/:id", (req, res) => {
  const { id } = req.params;
  const db = getDatabaseInstance(req.schema_name);

  db.get("SELECT * FROM menu WHERE id = ?", [id], (error, menu) => {
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    if (!menu) {
      res.status(404).json({ message: "Menu not found" });
      return;
    }

    new Promise((resolve, reject) => {
      db.all(
        `
        SELECT mi.*, mc.name AS category_name 
        FROM menu_item mi 
        JOIN menu_menu_item mmi ON mi.id = mmi.menu_item_id 
        JOIN menu_category mc ON mi.category_id = mc.id
        WHERE mmi.menu_id = ?`,
        [id],
        (err, itemsWithCategories) => {
          if (err) {
            reject(err);
          } else {
            const groupedItems = itemsWithCategories.reduce((acc, item) => {
              const { category_name, ...itemWithoutCategoryName } = item;
              if (!acc[category_name]) {
                acc[category_name] = [];
              }
              acc[category_name].push(itemWithoutCategoryName);
              return acc;
            }, {});

            resolve({ ...menu, items: groupedItems });
          }
        }
      );
    })
      .then((menuWithDetails) => res.json(menuWithDetails))
      .catch((error) => res.status(500).json({ error: error.message }));
  });
});

router.get("/", (req, res) => {
  const db = getDatabaseInstance(req.schema_name);
  db.all("SELECT * FROM menu", (error, menus) => {
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    if (menus.length === 0) {
      res.json(menus);
      return;
    }

    const menusWithDetails = menus.map(
      (menu) =>
        new Promise((resolve, reject) => {
          db.all(
            `
        SELECT mi.*, mc.name AS category_name 
        FROM menu_item mi 
        JOIN menu_menu_item mmi ON mi.id = mmi.menu_item_id 
        JOIN menu_category mc ON mi.category_id = mc.id
        WHERE mmi.menu_id = ?`,
            [menu.id],
            (err, itemsWithCategories) => {
              if (err) {
                reject(err);
              } else {
                const itemIds = itemsWithCategories.map((item) => item.id);
                resolve({ ...menu, itemIds });
              }
            }
          );
        })
    );

    Promise.all(menusWithDetails)
      .then((completedMenus) => res.json(completedMenus))
      .catch((err) => res.status(500).json({ error: err.message }));
  });
});

router.post("/new", (req, res) => {
  const { name, description, active, itemIds } = req.body;
  if (!name || active == null || !Array.isArray(itemIds)) {
    return res.status(400).json({ error: "Invalid menu data or item IDs" });
  }
  const db = getDatabaseInstance(req.schema_name);
  db.run("INSERT INTO menu (name, description, active) VALUES (?, ?, ?)", [name, description, active], function (error) {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      const menuId = this.lastID;
      let itemsProcessed = 0;
      itemIds.forEach((itemId) => {
        db.run("INSERT INTO menu_menu_item (menu_id, menu_item_id) VALUES (?, ?)", [menuId, itemId], (err) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          itemsProcessed++;
          if (itemsProcessed === itemIds.length) {
            res.status(201).json({ message: "Menu created successfully", id: menuId });
          }
        });
      });
      if (itemIds.length === 0) {
        res.status(201).json({ message: "Menu created successfully", id: menuId });
      }
    }
  });
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, description, active, itemIds } = req.body;
  const db = getDatabaseInstance(req.schema_name);
  db.run("UPDATE menu SET name = ?, description = ?, active = ? WHERE id = ?", [name, description, active, id], (error) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    } else {
      db.run("DELETE FROM menu_menu_item WHERE menu_id = ?", [id], (err) => {
        if (err) {
          return res.status(500).json({ error: error.message });
        }
        let itemsProcessed = 0;
        itemIds.forEach((itemId) => {
          db.run("INSERT INTO menu_menu_item (menu_id, menu_item_id) VALUES (?, ?)", [id, itemId], (err) => {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
          });
        });
        res.status(200).json({ message: "Menu updated successfully" });
      });
    }
  });
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const db = getDatabaseInstance(req.schema_name);
  db.run("DELETE FROM menu_menu_item WHERE menu_id = ?", [id], (error) => {
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    db.run("DELETE FROM menu WHERE id = ?", [id], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json({ message: "Menu deleted successfully" });
      }
    });
  });
});

module.exports = router;
