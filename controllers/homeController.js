const express = require('express');
const router = express.Router();
const services = require("../services/homeServices"); 

// Route to fetch promo banner URL
router.get('/promobanner', async (req, res) => {
  try {
    const bannerUrl = await services.getPromoBanner();
    res.json({ bannerUrl });
  } catch (error) {
    console.error('Error fetching promo banner:', error);
    res.status(500).send('An error occurred while fetching promo banner.');
  }
});

// Route to fetch featured iCafes
router.get('/getFeaturediCafes', async (req, res) => {
  try {
    const featurediCafes = await services.getFeaturediCafes();
    res.json(featurediCafes);
  } catch (error) {
    console.error('Error fetching featured iCafes:', error);
    res.status(500).send('An error occurred while fetching featured iCafes.');
  }
});

// Route to fetch all iCafes
router.get('/getAlliCafes', async (req, res) => {
  try {
    const alliCafes = await services.getAlliCafes();
    res.json(alliCafes);
  } catch (error) {
    console.error('Error fetching all iCafes:', error);
    res.status(500).send('An error occurred while fetching all iCafes.');
  }
});

// Route to search for iCafes by name
router.get('/getSearchediCafes', async (req, res) => {
  const { name } = req.params;
  try {
    const searchediCafes = await services.getSearchediCafes(name);
    res.json(searchediCafes);
  } catch (error) {
    console.error(`Error searching iCafes by name "${name}":`, error);
    res.status(500).send(`An error occurred while searching iCafes by name "${name}".`);
  }
});

// Route to fetch user billing info for a specific iCafe
router.get('/getUserBilling', async (req, res) => {
  const { username, icafe_id } = req.params;
  try {
    const userBilling = await services.getUserBilling(username, icafe_id);
    res.json(userBilling);
  } catch (error) {
    console.error(`Error fetching user billing info for username "${username}" and iCafe ${icafe_id}:`, error);
    res.status(500).send(`An error occurred while fetching user billing info for username "${username}" and iCafe ${icafe_id}.`);
  }
});

// Route to fetch username and eWallet balance for a specific user
router.get('/getUsername', async (req, res) => {
  const { userId, icafe_id } = req.params;
  try {
    const userInfo = await services.getUsername(userId, icafe_id);
    res.json(userInfo);
  } catch (error) {
    console.error(`Error fetching username and eWallet balance for userId ${userId} and iCafe ${icafe_id}:`, error);
    res.status(500).send(`An error occurred while fetching username and eWallet balance for userId ${userId} and iCafe ${icafe_id}.`);
  }
});

// Route to fetch PC categories for a specific iCafe
router.get('/getPCCategories', async (req, res) => {
  const { icafe_id } = req.params;
  try {
    const pcCategories = await services.getPCCategories(icafe_id);
    res.json(pcCategories);
  } catch (error) {
    console.error(`Error fetching PC categories for iCafe ${icafe_id}:`, error);
    res.status(500).send(`An error occurred while fetching PC categories for iCafe ${icafe_id}.`);
  }
});

// Route to fetch details of a specific iCafe
router.get('/getiCafeDetails', async (req, res) => {
  const { detailsId, icafe_id } = req.params;
  try {
    const iCafeDetails = await services.getiCafeDetails(detailsId, icafe_id);
    res.json(iCafeDetails);
  } catch (error) {
    console.error(`Error fetching details for iCafe with detailsId ${detailsId} and iCafe ${icafe_id}:`, error);
    res.status(500).send(`An error occurred while fetching details for iCafe with detailsId ${detailsId} and iCafe ${icafe_id}.`);
  }
});

// Route to fetch computer specifications for a specific iCafe detail
router.get('/getComputerSpecs', async (req, res) => {
  const { detailsId, icafe_id } = req.params;
  try {
    const computerSpecs = await services.getComputerSpecs(detailsId, icafe_id);
    res.json(computerSpecs);
  } catch (error) {
    console.error(`Error fetching computer specifications for iCafe detail ${detailsId} and iCafe ${icafe_id}:`, error);
    res.status(500).send(`An error occurred while fetching computer specifications for iCafe detail ${detailsId} and iCafe ${icafe_id}.`);
  }
});

// Route to fetch eWallet balance for a specific user
router.get('/geteWalletBalance', async (req, res) => {
  const { userId } = req.params;
  try {
    const eWalletBalance = await services.geteWalletBalance(userId);
    res.json(eWalletBalance);
  } catch (error) {
    console.error(`Error fetching eWallet balance for userId ${userId}:`, error);
    res.status(500).send(`An error occurred while fetching eWallet balance for userId ${userId}.`);
  }
});

module.exports = router;