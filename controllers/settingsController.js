const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const multer = require("multer");
const service = require("../services/settingsServices");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use(bodyParser.json());

router.get("/getUserProfile", async (req, res) => {
  const userId = req.query.userId;
  console.log("your userid:", userId);
  try {
    const userDetails = await service.getUserProfile(userId);

    console.log("user id: ", userId);
    if (userDetails) {
      res.status(200).json({ success: true, userDetails: userDetails[0] });
      console.log(userDetails[0]);
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching user details",
    });
  }
});

router.put("/updateUser", async (req, res) => {
  const { userId, username, email, fullname, phone } = req.body;

  try {
    const affectedRows = await service.updateUser(
      userId,
      username,
      email,
      fullname,
      phone
    );
    console.log(affectedRows);
    console.log(req.body);
    if (affectedRows) {
      res
        .status(200)
        .json({ success: true, message: "User updated successfully" });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the user",
    });
  }
});

router.delete("/deleteUser", async (req, res) => {
  const { userId } = req.body;

  try {
    const affectedRows = await service.deleteUser(userId);

    if (affectedRows > 0) {
      res
        .status(200)
        .json({ success: true, message: "User deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the user",
    });
  }
});

router.post("/changePassword", async (req, res) => {
  const { userId, oldPassword, newPassword, confirmPassword } = req.body;
  console.log(req.body);

  try {
    const result = await service.changePassword(
      userId,
      oldPassword,
      newPassword,
      confirmPassword
    );

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while changing the password",
    });
  }
});

module.exports = router;
