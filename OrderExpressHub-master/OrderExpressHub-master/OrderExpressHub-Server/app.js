const express = require("express");
const cors = require("cors");
const { initDatabase } = require("./OrderExpressHub-DataBase/index.js");
const verify = require("./features/auth.js");
const signupRoute = require("./features/signup.js");
const loginRoute = require("./features/login.js");
const itemsRoute = require("./features/item.js");
const menuRoute = require("./features/menu.js");
const kitchenRoute = require("./features/kitchen.js");
const orderRoute = require("./features/order.js");
const profileRoute = require("./features/profile.js");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

initDatabase();

app.use("/signup", signupRoute);
app.use("/login", loginRoute);

app.use(verify);

app.use("/items", itemsRoute);
app.use("/menu", menuRoute);
app.use("/kitchen", kitchenRoute);
app.use("/orders", orderRoute);
app.use("/profile", profileRoute);

//Testing authenticatoin
app.get("/testauth", (req, res) => {
  res.status(200).send({ message: "Successful auth" });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
