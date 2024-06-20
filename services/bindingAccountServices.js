const {db, db2} = require("../db");

module.exports.getExternalAccount = async () => {
    const [externalAccounts] = await db2.query(
      "SELECT * FROM `accounts`",
    );
    return externalAccounts;
  };

module.exports.validateAccount = async (userBody, passwordBody) => {
    const [user] = await db2.query(
      "SELECT username, regular_billing, vip_billing, vvip_billing FROM accounts WHERE username = ? AND password = ?", 
      [userBody, passwordBody]
    );
    console.log("User from DB:", user);

  if (user && (await bcrypt.compare(passwordBody, user[0].password))) {
    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1y" }
    );
    return { user, token };
  } else {
    return null;
  }
  };

module.exports.insertAccount = async (userBody, passwordBody) => {
    const [insertAccount] = await db2.query(
      "INSERT INTO gamers_paradise.accounts (username, password, regular_billing, vip_billing, vvip_billing) VALUES  (?, ?, '00:00:00', '00:00:00', '00:00:00')", 
      [userBody, passwordBody]
    );
    return insertAccount;
  };

  module.exports.unbindAccount = async (userBody) => {
    const [unbindAccount] = await db.query(
      "DELETE FROM icafes.binding_account WHERE username_binding = ?", 
      [userBody]
    );
    return unbindAccount;
  };