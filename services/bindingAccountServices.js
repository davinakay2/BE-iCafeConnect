const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { db, db1, db2, db3, getDatabaseById } = require("../db");
const JWT_SECRET = process.env.JWT_SECRET;

module.exports.validateAccount = async (
  user_id,
  icafe_id,
  username,
  password
) => {
  try {
    const selectedDb = getDatabaseById(icafe_id);
    console.log("Selected Database:", selectedDb);

    // Step 1: Verify username and password in accounts table
    const [userResult] = await selectedDb.query(
      "SELECT username, password FROM accounts WHERE username = ?",
      [username]
    );

    if (userResult.length === 0) {
      console.log("User not found in accounts table.");
      return null;
    }

    const user = userResult[0];
    console.log("User from DB:", user);

    if (user && user.password) {
      // Verify password using bcrypt
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        // Step 2: Check if the username already exists in the binding_account table
        const [existingBinding] = await db.query(
          "SELECT username_binding FROM binding_account WHERE username_binding = ?",
          [user.username]
        );

        if (existingBinding.length > 0) {
          // Update user_id in binding_account table
          await db.query(
            "UPDATE binding_account SET user_id = ? WHERE username_binding = ?",
            [user_id, user.username]
          );
        } else {
          // Insert into binding_account table
          const hashedPassword = await bcrypt.hash(password, 10);
          await db.query(
            "INSERT INTO binding_account (user_id, icafe_id, username_binding, password_binding) VALUES (?, ?, ?, ?)",
            [user_id, icafe_id, user.username, hashedPassword]
          );
        }

        // Generate JWT
        const token = jwt.sign(
          { id: user.id, username: user.username },
          JWT_SECRET,
          { expiresIn: "1y" }
        );

        return { user, token };
      } else {
        console.log("Password mismatch.");
        return null;
      }
    } else {
      console.log("User or password not found.");
      return null;
    }
  } catch (error) {
    console.error(
      `Error validating account for username "${username}" and iCafe ${icafe_id}:`,
      error
    );
    throw error;
  }
};

module.exports.insertAccount = async (icafe_id, userId) => {
  const selectedDb = getDatabaseById(icafe_id);

  try {
    // Fetch username and password from icafe_users table using userid
    const [userResult] = await selectedDb.query(
      "SELECT username, password FROM icafe_users WHERE userid = ?;",
      [userId]
    );

    if (userResult.length === 0) {
      throw new Error(`User with userid ${userId} not found`);
    }

    const { username, password } = userResult[0];
    const iccUsername = `icc${username}`;

    // Check if the username already exists in the accounts table
    const [existingAccount] = await selectedDb.query(
      "SELECT username FROM accounts WHERE username = ?;",
      [iccUsername]
    );

    if (existingAccount.length > 0) {
      return { message: `Username ${iccUsername} already exists in accounts.` };
    }

    // Insert a new record into the accounts table using fetched username and password
    const [insertAccount] = await selectedDb.query(
      "INSERT INTO accounts (username, password, regular_billing, vip_billing, vvip_billing) VALUES (?, ?, '00:00:00', '00:00:00', '00:00:00');",
      [iccUsername, password]
    );

    return {
      affectedRows: insertAccount.affectedRows,
      message: "Account Created Successfully!",
    };
  } catch (error) {
    throw new Error(`Error inserting account: ${error.message}`);
  }
};

module.exports.unbindAccount = async (binding_id) => {
  const [unbindAccount] = await db.query(
    `DELETE FROM icafes.binding_account WHERE binding_id = ?`,
    [binding_id]
  );
  return unbindAccount;
};

module.exports.getBindAccount = async (user_id) => {
  const [getBindAccount] = await db.query(
    `SELECT binding_id, username_binding, ii.name, ba.icafe_id FROM binding_account ba JOIN icafe_info ii on ba.icafe_id = ii.icafe_id WHERE ba.user_id = ?`,
    [user_id]
  );
  return getBindAccount;
};
