const express = require('express');
const router = express.Router();
const services = require("../services/historyServices"); 

router.get('/displayICafeBillingHistory', async (req, res) => {
    try {
        const history = await services.displayICafeBillingHistory(); // Implement this function in your service
        res.status(200).json(history);
    } catch (error) {
        console.error('Error fetching iCafe billing history:', error.message);
        res.status(500).json({ error: 'Failed to fetch iCafe billing history' });
    }
});

// Route to fetch eWallet top-up history
router.get('/displayEwalletTopupHistory', async (req, res) => {
    try {
        const history = await services.displayEwalletTopupHistory(); // Implement this function in your service
        res.status(200).json(history);
    } catch (error) {
        console.error('Error fetching eWallet top-up history:', error.message);
        res.status(500).json({ error: 'Failed to fetch eWallet top-up history' });
    }
});

module.exports = router;