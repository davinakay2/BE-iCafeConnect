const express = require("express"),
router = express.Router();
const bodyParser = require('body-parser');

const service = require("../services/settingsServices");
const app = express();

app.use(bodyParser.json());

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
  

module.exports = router;