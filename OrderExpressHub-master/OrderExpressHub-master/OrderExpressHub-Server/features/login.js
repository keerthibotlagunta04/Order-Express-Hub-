const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { getDatabaseInstance } = require("../OrderExpressHub-DataBase");

KEY = "JDAfWkyOOGppzX1dkMmcBuSyVUh1eJDfH7dbFgw";

router.post("/", (req, res) => {
  db = getDatabaseInstance("./Group3_OrderExpressHub.sqlite");
  const { email, password, org_name } = req.body;

  const query = "SELECT * FROM users WHERE email = ?";

  db.get(query, [email], (err, user) => {
    if (err) {
      return res.status(500).send({ message: "Error on the server." });
    }
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).send({ auth: false, message: "Wrong Password" });
    }
    db.get(
      `SELECT *
      FROM user_orgs
      JOIN organizations ON user_orgs.org_id = organizations.id
      WHERE user_orgs.user_id = ? AND organizations.name = ?;`,
      [user.id, org_name],
      (err, user_org) => {
        if (err) {
          return res.status(500).send("Error on the server.");
        }
        if (!user_org) {
          return res.status(404).send("User not found associated with this organization.");
        }
        const token = jwt.sign({ user_id: user_org.user_id, org_id: user_org.org_id, role: user_org.role, org_name }, KEY, {
          expiresIn: 86400,
        });
        res.status(200).send({ auth: true, token: token, role: user_org.role, user_id: user_org.user_id });
      }
    );

    db.close();
  });
});

module.exports = router;
