const {db, db2} = require("../db");
const bcrypt = require('bcrypt');
const { Storage } = require('@google-cloud/storage');
const storage = new Storage({ keyFilename: '../services/settingsServices.json' });
const bucket = storage.bucket('profile-bucket');

module.exports.getUserProfile = async (userId) => {
    const [userData] = await db.query(
      "SELECT `fullname`, `username`, `email`, `phone` FROM `icafe_users` WHERE `userid` = ?",
      [userId]
    );
  
    if (userData.length > 0) {
    
      return {
        fullname: userData[0].fullname,
        username: userData[0].username,
        email: userData[0].email,
        phone: userData[0].phone
      };
    } else {
      return null; 
    }
  };

module.exports.updateUser = async (userId, username, email, fullname, phone) => {
    const [{ affectedRows }] = await db.query(
      "UPDATE `icafe_users` SET `username` = ?, `email` = ?, `fullname` = ?, `phone` = ? WHERE `userid` = ?",
      [username, email, fullname, phone, userId]
    );
    return affectedRows;
  };

  module.exports.deleteUser = async (userId) => {
    const [{ affectedRows }] = await db.query(
      "DELETE FROM `icafe_users` WHERE `userid` = ?",
      [userId]
    );
    return affectedRows;
  };

  module.exports.changePassword = async (userId, oldPassword, newPassword, confirmPassword) => {
    if (newPassword !== confirmPassword) {
        return { success: false, message: 'New passwords do not match' };
      }
    
    const [user] = await db.query(
      "SELECT password FROM `icafe_users` WHERE `userid` = ?",
      [userId]
    );
  
    if (user.length === 0) {
      return { success: false, message: 'User not found' };
    }
  
    const userPassword = user[0].password;
  
    const match = await bcrypt.compare(oldPassword, userPassword);
    if (!match) {
      return { success: false, message: 'Old password is incorrect' };
    }
  
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  
    const [{ affectedRows }] = await db.query(
      "UPDATE `icafe_users` SET `password` = ? WHERE `userid` = ?",
      [hashedPassword, userId]
    );
  
    return affectedRows > 0
      ? { success: true, message: 'Password updated successfully' }
      : { success: false, message: 'Password update failed' };
  }; 

  module.exports.uploadProfilePicture = async (userId, file) => {
    const blob = bucket.file(file.originalname);
    const blobStream = blob.createWriteStream({ resumable: false });
  
    return new Promise((resolve, reject) => {
      blobStream.on('error', (err) => reject(err));
      
      blobStream.on('finish', async () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        await db.query(
          "UPDATE icafe_users SET profile_picture_url = ? WHERE userid = ?",
          [publicUrl, userId]
        );
        resolve(publicUrl);
      });
  
      blobStream.end(file.buffer);
    });
  };
  
  module.exports.getProfilePicture = async (userId) => {
    const [result] = await db.query(
      "SELECT profile_picture_url FROM icafe_users WHERE userid = ?",
      [userId]
    );
    return result.length ? result[0].profile_picture_url : null;
  };
  
  