const express = require("express");
const app = express();
const bodyparser = require("body-parser");
require("express-async-errors");
require("dotenv").config();

const { db, db1, db2, db3 } = require("./db");
const loginRoutes = require("./controllers/loginController");
const homeRoutes = require("./controllers/homeController");
const bindingAccountRoutes = require("./controllers/bindingAccountController");
const paymentRoutes = require("./controllers/paymentController");
const settingsRoutes = require("./controllers/settingsController");
const icafepageRoutes = require("./controllers/icafepageController");

app.use(express.json());
app.use(bodyparser.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.use("/loginpage", loginRoutes);
app.use("/homepage", homeRoutes);
app.use("/bindingaccountpage", bindingAccountRoutes);
app.use("/paymentpage", paymentRoutes);
app.use("/settingspage", settingsRoutes);
app.use("/icafepage", icafepageRoutes);

const path = require("path");
app.use("/icafeimgs", express.static(path.join(__dirname, "../icafeimgs")));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).send("Something went wrong!");
});

// Ensure the db connection is successful
Promise.all([
  db.query("SELECT 1"),
  db1.query("SELECT 1"),
  db2.query("SELECT 1"),
  db3.query("SELECT 1"),
])
  .then(() => {
    console.log("All database connections succeeded.");
    app.listen(3000, () => console.log("Server started at port 3000"));
  })
  .catch((err) => {
    console.log("Database connection failed. \n" + err);
  });
