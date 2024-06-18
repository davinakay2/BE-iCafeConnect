const {db, db2} = require("../db");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

module.exports.loginVerification = async (userBody, passwordBody) => {
  const [user] = await db.query(
    "SELECT userid, username, password FROM icafe_users WHERE username = ? OR email = ?",
    [userBody, userBody]
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

module.exports.userValidity = async (userBody) => {
  const [userValidation] = await db.query(
    "SELECT username FROM `icafe_users` WHERE username = ? OR email = ?",
    [userBody, userBody]
  );
  return userValidation;
};

module.exports.usernameValidity = async (usernameBody) => {
  const [usernameValidation] = await db.query(
    "SELECT username FROM `icafe_users` WHERE username = ?",
    [usernameBody]
  );
  return usernameValidation;
};

module.exports.emailValidity = async (emailBody) => {
  const [emailValidation] = await db.query(
    "SELECT username FROM `icafe_users` WHERE email = ?",
    [emailBody]
  );
  return emailValidation;
};

module.exports.addUser = async (
  usernameBody,
  passwordBody,
  emailBody,
  fullnameBody,
  phonenumberBody
) => {
  const hashedPassword = await bcrypt.hash(passwordBody, 10);
  const [{ affectedRows }] = await db.query(
    "INSERT INTO `icafe_users` (`username`, `password`, `email`, `fullname`, `phone`) VALUES (?, ?, ?, ?, ?);",
    [usernameBody, hashedPassword, emailBody, fullnameBody, phonenumberBody]
  );
  return affectedRows;
};

module.exports.updatePassword = async (emailBody, newPassword) => {
  // Hash the new password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

  const [result] = await db.query(
    "UPDATE `icafe_users` SET password = ? WHERE email = ?",
    [hashedPassword, emailBody]
  );

  // Check if the update was successful
  if (result.affectedRows > 0) {
    return { success: true, message: 'Password updated successfully' };
  } else {
    return { success: false, message: 'No user found with the provided email' };
  }
};