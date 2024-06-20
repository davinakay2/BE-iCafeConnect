const { db, db1, db2, db3 } = require("../db");

const getDatabaseById = (icafe_id) => {
  switch(icafe_id) {
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

module.exports.getExternalAccount = async (icafe_id) => {
  const selectedDb = getDatabaseById(icafe_id);
  const [externalAccounts] = await selectedDb.query(
    "SELECT * FROM `accounts`"
  );
  return externalAccounts;
};

module.exports.validateAccount = async (icafe_id, userBody, passwordBody) => {
  const selectedDb = getDatabaseById(icafe_id);
  const [user] = await selectedDb.query(
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
    return null;
  }
};

module.exports.insertAccount = async (icafe_id, userBody, passwordBody) => {
  const selectedDb = getDatabaseById(icafe_id);
  const [insertAccount] = await selectedDb.query(
    "INSERT INTO gamers_paradise.accounts (username, password, regular_billing, vip_billing, vvip_billing) VALUES  (?, ?, '00:00:00', '00:00:00', '00:00:00')", 
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