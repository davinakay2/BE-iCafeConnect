const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "server408",
  database: "icafes",
});

const db1 = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "server408",
  database: "gamers_paradise",
});

const db2 = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "server408",
  database: "high_grounds_pik",
});
const db3 = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "server408",
  database: "orion",
});

module.exports = { db, db1, db2, db3 };
