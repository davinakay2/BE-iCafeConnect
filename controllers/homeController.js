const express = require("express");
const router = express.Router();
const services = require("../services/homeServices");
const path = require("path");

// Route to fetch featured iCafes
router.get("/getFeaturediCafes", async (req, res) => {
  try {
    const featurediCafes = await services.getFeaturediCafes();
    res.json(featurediCafes);
  } catch (error) {
    console.error("Error fetching featured iCafes:", error);
    res.status(500).send("An error occurred while fetching featured iCafes.");
  }
});
// Route to fetch all iCafes
router.get("/getAlliCafes", async (req, res) => {
  try {
    const alliCafes = await services.getAlliCafes();
    res.json(alliCafes);
  } catch (error) {
    console.error("Error fetching all iCafes:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching all iCafes.",
    });
  }
});
// Get iCafe Ads
router.get("/getAdsiCafes", async (req, res) => {
  try {
    const adsiCafes = await services.getAdsiCafes();
    res.json(adsiCafes);
  } catch (error) {
    console.error("Error fetching ads iCafes:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching ads iCafes.",
    });
  }
});

// Route to fetch user billing info for a specific iCafe
router.get("/getUserBilling", async (req, res) => {
  const { username, icafe_id } = req.query;
  console.log(req.query);
  try {
    const userBilling = await services.getUserBilling(username, icafe_id);
    res.json(userBilling);
  } catch (error) {
    console.error(
      `Error fetching user billing info for username "${username}" and iCafe ${icafe_id}:`,
      error
    );
    res
      .status(500)
      .send(
        `An error occurred while fetching user billing info for username "${username}" and iCafe ${icafe_id}.`
      );
  }
});

// Route to fetch username and eWallet balance for a specific user
router.get("/getUsername", async (req, res) => {
  try {
    const userId = req.query.userid;
    if (!userId) {
      return res.status(400).json({ error: "Missing userid parameter" });
    }

    const username = await services.getUsername(userId);
    console.log(username);
    if (username) {
      res.json(username);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching username:", error);
    res.status(500).send("An error occurred while fetching username.");
  }
});

// Route to fetch eWallet balance for a specific user
router.get("/geteWalletBalance", async (req, res) => {
  const userId = req.query.userid;
  try {
    const eWalletBalance = await services.geteWalletBalance(userId);
    res.json(eWalletBalance);
    console.log(eWalletBalance);
  } catch (error) {
    console.error(
      `Error fetching eWallet balance for userId ${userId}:`,
      error
    );
    res
      .status(500)
      .send(
        `An error occurred while fetching eWallet balance for userId ${userId}.`
      );
  }
});

module.exports = router;
