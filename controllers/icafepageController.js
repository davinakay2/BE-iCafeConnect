const express = require('express');
const router = express.Router();
const services = require('../services/icafepageServices'); // Adjust the path as needed

router.post("/getPCCategories", async (req, res) => {
  try {
    const { icafe_id } = req.body; // Change to req.body to get data from POST request body
    if (!icafe_id) {
      return res.status(400).send("Missing icafe_id parameter");
    }
    const categories = await services.getPCCategories(icafe_id);
    res.json(categories);
  } catch (error) {
    console.error("Error fetching PC categories:", error);
    res.status(500).send("An error occurred while fetching PC categories.");
  }
});

// Route to fetch PC billing info for a specific pc_category
router.post("/getPCBillingInfo", async (req, res) => {
  try {
    const { icafe_id, pc_category } = req.body;
    if (!icafe_id || !pc_category) {
      return res.status(400).send("Missing icafe_id or pc_category parameter");
    }
    const billingInfo = await services.getPCBillingInfo(icafe_id, pc_category);
    res.json(billingInfo);
  } catch (error) {
    console.error("Error fetching PC billing info:", error);
    res.status(500).send("An error occurred while fetching PC billing info.");
  }
});

// Route to fetch computer specifications for a given icafe_detail_id
router.post("/getComputerSpecifications", async (req, res) => {
  try {
    const { icafe_detail_id } = req.body;
    if (!icafe_detail_id) {
      return res.status(400).send("Missing icafe_detail_id parameter");
    }
    const specifications = await services.getComputerSpecifications(icafe_detail_id);
    res.json(specifications);
  } catch (error) {
    console.error("Error fetching computer specifications:", error);
    res.status(500).send("An error occurred while fetching computer specifications.");
  }
});

// Route to fetch billing prices for a given icafe_detail_id using POST request
router.post("/getBillingPrices", async (req, res) => {
  try {
    const { icafe_detail_id } = req.body;
    if (!icafe_detail_id) {
      return res.status(400).send("Missing icafe_detail_id parameter");
    }
    const prices = await services.getBillingPrices(icafe_detail_id);
    res.json(prices);
  } catch (error) {
    console.error("Error fetching billing prices:", error);
    res.status(500).send("An error occurred while fetching billing prices.");
  }
});

module.exports = router;
