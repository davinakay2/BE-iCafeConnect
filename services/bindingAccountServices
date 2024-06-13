const {db, db2} = require("../db");

module.exports.getExternalAccount = async () => {
    const [externalAccounts] = await db2.query(
      "SELECT * FROM `accounts`",
    );
    return externalAccounts;
  };

module.exports.validateAccount = async (userBody, passwordBody) => {
    const [validateAccount] = await db2.query(
      "SELECT username, regular_billing, vip_billing, vvip_billing FROM accounts WHERE username = ? AND password = ?", 
      [userBody, passwordBody]
    );
    return validateAccount;
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