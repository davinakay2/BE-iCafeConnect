const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "server408",
  connectionLimit: 10,
  database: "icafes",
});

const db1 = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "server408",
  connectionLimit: 10,
  database: "gamers_paradise",
});

const db2 = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "server408",
  connectionLimit: 10,
  database: "tokyo_gaming_space",
});
const db3 = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "server408",
  connectionLimit: 10,
  database: "high_grounds_pik",
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

const getDatabaseNameById = (icafe_id) => {
  // Ensure icafe_id is treated as a number
  const id = Number(icafe_id);
  switch (id) {
    case 1:
      return "gamers_paradise";
    case 2:
      return "tokyo_gaming_space";
    case 3:
      return "high_grounds_pik";
    default:
      return db;
  }
};

const allDatabaseNames = [
  "gamers_paradise",
  "tokyo_gaming_space",
  "high_grounds_pik",
];

// module.exports = { getDatabaseById, db, db1, db2, db3 };
module.exports = {
  getDatabaseById,
  getDatabaseNameById,
  db,
  db1,
  db2,
  db3,
  allDatabaseNames,
};
