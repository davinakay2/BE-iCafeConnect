const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db, db1, db2, db3 } = require("../db");
const JWT_SECRET = process.env.JWT_SECRET;

module.exports.getExternalAccount = async (icafe_id) => {
  const selectedDb = getDatabaseById(icafe_id);
  const [externalAccounts] = await selectedDb.query(
    "SELECT * FROM `accounts`"
  );
  return externalAccounts;
};

module.exports.validateAccount = async (user_id, icafe_id, userBody, passwordBody) => {
  const getDatabaseById = (icafe_id) => {
    switch (icafe_id) {
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

  const selectedDb = getDatabaseById(icafe_id);

  // Step 1: Verify username and password in accounts table
  const [userResult] = await selectedDb.query(
    "SELECT username, password, regular_billing, vip_billing, vvip_billing FROM accounts WHERE username = ?", 
    [userBody]
  );

  const user = userResult[0];
  console.log("User from DB:", user);

  if (user && user.password) {
    // Verify password using bcrypt
    const passwordMatch = await bcrypt.compare(passwordBody, user.password);

    if (passwordMatch) {
      // Step 2: Check if the username already exists in the binding_account table
      const [existingBinding] = await db.query(
        "SELECT username_binding FROM binding_account WHERE username_binding = ?", 
        [user.username]
      );

      if (existingBinding.length === 0) {
        // Insert into binding_account table
        const hashedPassword = await bcrypt.hash(passwordBody, 10);
        await db.query(
          "INSERT INTO binding_account (userid, icafe_id, username_binding, password_binding, regular_billing, vip_billing, vvip_billing) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [user_id, icafe_id, user.username, hashedPassword, user.regular_billing, user.vip_billing, user.vvip_billing]
        );
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "1y" }
      );

      return { user, token };
    }
  }

  // Incorrect username or password
  return null;
};

module.exports.insertAccount = async (icafe_id, userBody, passwordBody) => {
  const selectedDb = getDatabaseById(icafe_id);
  const [insertAccount] = await selectedDb.query(
    "INSERT INTO accounts (username, password, regular_billing, vip_billing, vvip_billing) VALUES  (?, ?, '00:00:00', '00:00:00', '00:00:00')", 
    [userBody, passwordBody]
  );
  return insertAccount;
};

module.exports.unbindAccount = async (icafe_id, userBody) => {
  const selectedDb = getDatabaseById(icafe_id);
  const [unbindAccount] = await selectedDb.query(
    "DELETE FROM icafes.binding_account WHERE username_binding = ?", 
    [userBody]
  );
  return unbindAccount;
};