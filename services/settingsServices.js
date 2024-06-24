const { db, db2 } = require("../db");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs").promises;

async function getUserProfile(userId) {
  const result = await db.query(
    "SELECT userid, fullname, username, email, phone FROM icafe_users WHERE userid = ?",
    [userId]
  );
  return result[0];
}

async function updateUser(userId, username, email, fullname, phone) {
  try {
    const [{ affectedRows }] = await db.query(
      "UPDATE `icafe_users` SET `username` = ?, `email` = ?, `fullname` = ?, `phone` = ? WHERE `userid` = ?",
      [username, email, fullname, phone, userId]
    );
    return affectedRows > 0
      ? { success: true, message: "User updated successfully" }
      : { success: false, message: "User update failed" };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "An error occurred while updating the user",
    };
  }
}

module.exports.deleteUser = async (userId) => {
  const [{ affectedRows }] = await db.query(
    "DELETE FROM `icafe_users` WHERE `userid` = ?",
    [userId]
  );
  return affectedRows;
};

async function changePassword(
  userId,
  oldPassword,
  newPassword,
  confirmPassword
) {
  try {
    if (newPassword !== confirmPassword) {
      return { success: false, message: "New passwords do not match" };
    }

    const [user] = await db.query(
      "SELECT password FROM `icafe_users` WHERE `userid` = ?",
      [userId]
    );
    if (user.length === 0) {
      return { success: false, message: "User not found" };
    }

    const userPassword = user[0].password;

    const match = await bcrypt.compare(oldPassword, userPassword);
    if (!match) {
      return { success: false, message: "Old password is incorrect" };
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const [{ affectedRows }] = await db.query(
      "UPDATE `icafe_users` SET `password` = ? WHERE `userid` = ?",
      [hashedPassword, userId]
    );

    return affectedRows > 0
      ? { success: true, message: "Password updated successfully" }
      : { success: false, message: "Password update failed" };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "An error occurred while changing the password",
    };
  }
}

module.exports = {
  getUserProfile,
  changePassword,
  updateUser,
};
