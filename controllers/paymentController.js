const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const {db,db2} = require("../db");

const { createMidtransTransaction } = require('../services/paymentServices');

// Route handling function
router.post('/topup', async (req, res) => {
    const { billing_price_id, payment_method, user_id } = req.body;
  
    try {
      // Check if user_id is provided
      if (user_id === undefined) {
        return res.status(400).json({ error: 'userid is required' });
      }
  
      // Fetch billing price details from your database using connection pool
      const [results] = await db.execute('SELECT price FROM billing_price WHERE billing_price_id = ?', [billing_price_id]);
  
      if (results.length === 0) {
        return res.status(404).json({ error: 'Billing option not found' });
      }
  
      const { price } = results[0];
      const orderId = uuidv4(); // Generate a unique order ID
  
      // Create transaction in Midtrans
      const paymentResponse = await createMidtransTransaction(orderId, price, payment_method);
  
      if (paymentResponse.status_code !== '201') {
        return res.status(500).json({ error: 'Payment processing failed' });
      }
  
      // Insert transaction history into your database using connection pool
      const [insertResult] = await db.execute('INSERT INTO icafe_transactions (billing_price_id, user_id, time, date) VALUES (?, ?, NOW(), NOW())', [billing_price_id, user_id]);
  
      res.json({ message: 'Payment successful', paymentResponse });
    } catch (error) {
      console.error('Error in topupBilling:', error.message);
      res.status(500).json({ error: 'Transaction failed' });
    }
  });
  
  module.exports = router;