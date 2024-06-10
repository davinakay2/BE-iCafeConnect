const mysql = require("mysql2/promise");

const mysqlPool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root123",
  database: "icafes",
});


  module.exports = mysqlPool
