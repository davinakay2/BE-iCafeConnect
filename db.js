const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root123",
  database: "icafes",
});

const db2 = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root123",
  database: "gamers_paradise",
});


  module.exports = {db, db2}
