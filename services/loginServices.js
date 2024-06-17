const {db, db2} = require("../db");
const bcrypt = require('bcrypt');

module.exports.loginVerification = async (userBody, passwordBody) => {
  const [user] = await db.query(
    "SELECT * FROM `icafe_users` WHERE (username = ? OR email = ?) AND password = ?;",
    [userBody, userBody, passwordBody]
  );
  return user;
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
  const [{ affectedRows }] = await db.query(
    "INSERT INTO `icafe_users` (`username`, `password`, `email`, `fullname`, `phone`) VALUES (?, ?, ?, ?, ?);",
    [usernameBody, passwordBody, emailBody, fullnameBody, phonenumberBody]
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