const db = require("../db");

module.exports.loginVerification = async (userBody, passwordBody) => {
  const [user] = await db.query(
    "SELECT * FROM `user` WHERE (UserName = ? OR UserEmail = ?) AND UserPassword = ?;",
    [userBody, userBody, passwordBody]
  );
  return user;
};

module.exports.userValidity = async (userBody) => {
  const [userValidation] = await db.query(
    "SELECT UserName FROM `user` WHERE UserName = ? OR UserEmail = ?",
    [userBody, userBody]
  );
  return userValidation;
};

module.exports.usernameValidity = async (usernameBody) => {
  const [usernameValidation] = await db.query(
    "SELECT UserName FROM `user` WHERE UserName = ?",
    [usernameBody]
  );
  return usernameValidation;
};

module.exports.emailValidity = async (emailBody) => {
  const [emailValidation] = await db.query(
    "SELECT UserName FROM `user` WHERE UserEmail = ?",
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
    "INSERT INTO `user` (`UserName`, `UserPassword`, `UserEmail`, `UserFullName`, `UserPhone`) VALUES (?, ?, ?, ?, ?);",
    [usernameBody, passwordBody, emailBody, fullnameBody, phonenumberBody]
  );
  return affectedRows;
};