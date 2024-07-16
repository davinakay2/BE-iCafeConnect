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
const getDatabaseById = (icafe_id) => {
  // Ensure icafe_id is treated as a number
  const id = Number(icafe_id);
  switch (id) {
    case 1:
      return db1;
    case 2:
      return db2;
    case 3:
      return db3;
    default:
      return db;
  }
};
module.exports = { getDatabaseById, db, db1, db2, db3 };
