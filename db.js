const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root123",
  database: "icafes",
});

const db1 = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root123",
  database: "gamers_paradise",
});

const db2 = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root123",
  database: "high_grounds_pik",
});
const db3 = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root123",
  database: "orion",
});

  module.exports = {db, db2}
