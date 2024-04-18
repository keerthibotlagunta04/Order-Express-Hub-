const jwt = require("jsonwebtoken");

KEY = "JDAfWkyOOGppzX1dkMmcBuSyVUh1eJDfH7dbFgw";

function verify(req, res, next) {
  const token = req.headers["access-token"];
  if (!token) {
    return res.status(403).send({ auth: false, message: "No token provided." });
  }

  jwt.verify(token, KEY, (err, decoded) => {
    if (err) {
      return res.status(440).send({ auth: false, message: "Session Expired Logging Out" });
    }
    req.user_id = decoded.user_id;
    req.org_id = decoded.org_id;
    req.org_name = decoded.org_name;
    req.schema_name = decoded.org_id + "_" + decoded.org_name + ".sqlite";
    req.role = decoded.role;
    next();
  });
}

module.exports = verify;
