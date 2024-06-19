const express = require("express"),
router = express.Router();
const bodyParser = require('body-parser');
const service = require("../services/settingsServices");
const app = express();

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

app.use(bodyParser.json());

app.get('/getUserProfile', async (req, res) => {
    const { userId } = req.query; 
  
    try {
      const userDetails = await userService.getUserProfile(userId);
  
      if (userDetails) {
        res.status(200).json({ success: true, userDetails });
      } else {
        res.status(404).json({ success: false, message: 'User not found' });
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      res.status(500).json({ success: false, message: 'An error occurred while fetching user details' });
    }
  });

app.put('/updateUser', async (req, res) => {
    const { userId, username, email, fullname, phone } = req.body;
  
    try {
      const affectedRows = await service(userId, username, email, fullname, phone);
  
      if (affectedRows > 0) {
        res.status(200).json({ success: true, message: 'User updated successfully' });
      } else {
        res.status(404).json({ success: false, message: 'User not found' });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ success: false, message: 'An error occurred while updating the user' });
    }
  });

  app.delete('/deleteUser', async (req, res) => {
    const { userId } = req.body;
  
    try {
      const affectedRows = await service(userId);
  
      if (affectedRows > 0) {
        res.status(200).json({ success: true, message: 'User deleted successfully' });
      } else {
        res.status(404).json({ success: false, message: 'User not found' });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ success: false, message: 'An error occurred while deleting the user' });
    }
  });
  

app.post('/changePassword', async (req, res) => {
    const { userId, oldPassword, newPassword, confirmPassword } = req.body;
  
    try {
      const result = await service(userId, oldPassword, newPassword, confirmPassword);
  
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ success: false, message: 'An error occurred while changing the password' });
    }
  });

  router.post('/uploadProfilePicture', upload.single('profilePicture'), async (req, res) => {
    const { userId } = req.body;
  
    try {
      if (!req.file) {
        return res.status(400).send('No file uploaded.');
      }
  
      const publicUrl = await service.uploadProfilePicture(userId, req.file);
      res.status(200).json({ success: true, profilePictureUrl: publicUrl });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      res.status(500).json({ success: false, message: 'An error occurred while uploading profile picture' });
    }
  });
  
  router.get('/getProfilePicture', async (req, res) => {
    const { userId } = req.query;
  
    try {
      const profilePictureUrl = await service.getProfilePicture(userId);
  
      if (profilePictureUrl) {
        res.status(200).json({ success: true, profilePictureUrl });
      } else {
        res.status(404).json({ success: false, message: 'Profile picture not found' });
      }
    } catch (error) {
      console.error('Error retrieving profile picture:', error);
      res.status(500).json({ success: false, message: 'An error occurred while retrieving profile picture' });
    }
  });
  

module.exports = router;