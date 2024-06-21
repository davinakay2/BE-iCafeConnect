const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const {db, db1, db2, db3} = require("../db");

const { createMidtransTransaction } = require('../services/paymentServices');
const { insertICafeBillingHistory } = require('../services/historyServices');
const { insertEwalletTopupHistory } = require('../services/historyServices');

// Route handling function
router.post('/topupBilling', async (req, res) => {
const { billing_price_id, payment_method, user_id } = req.body;

try {
    // Check if user_id is provided
    if (user_id === undefined) {
        return res.status(400).json({ error: 'userid is required' });
    }

    // Fetch billing price details and icafe_detail_id from your database
    const [billingResults] = await db.execute(
        'SELECT price, icafe_detail_id, hours FROM billing_price WHERE billing_price_id = ?',
        [billing_price_id]
    );

    if (billingResults.length === 0) {
        return res.status(404).json({ error: 'Billing option not found' });
    }

    const { price, icafe_detail_id, hours } = billingResults[0];

    // Fetch icafe_id and pc_category using icafe_detail_id
    const [icafeResults] = await db.execute(
        'SELECT icafe_id, pc_category FROM icafe_details WHERE icafe_detail_id = ?',
        [icafe_detail_id]
    );

    if (icafeResults.length === 0) {
        return res.status(404).json({ error: 'iCafe details not found' });
    }

    const { icafe_id, pc_category } = icafeResults[0];

    // Fetch username_binding from the binding_account table
    const [bindingResults] = await db.execute(
        'SELECT username_binding FROM binding_account WHERE userid = ?',
        [user_id]
    );

    if (bindingResults.length === 0) {
        return res.status(404).json({ error: 'Binding account not found' });
    }

    const { username_binding } = bindingResults[0];

    // Determine the appropriate database based on icafe_id
    const dbToUse = (icafe_id) => {
        switch(icafe_id) {
            case 1:
                return db1;
            case 2:
                return db2;
            case 3:
                return db3;
            default:
                return db;
        }
    };

    // Fetch username from the accounts table using username_binding
    const [accountResults] = await dbToUse(icafe_id).execute(
        'SELECT account_id FROM accounts WHERE username = ?',
        [username_binding]
    );

    if (accountResults.length === 0) {
        return res.status(404).json({ error: 'Account not found' });
    }

    const { account_id } = accountResults[0];

    // Determine the billing column to update based on pc_category
    let billingColumn;
    switch(pc_category) {
        case 'Regular':
            billingColumn = 'regular_billing';
            break;
        case 'VIP':
            billingColumn = 'vip_billing';
            break;
        case 'VVIP':
            billingColumn = 'vvip_billing';
            break;
        default:
            return res.status(400).json({ error: 'Invalid PC category' });
    }

    const orderId = uuidv4(); // Generate a unique order ID

    // Create transaction in Midtrans
    const paymentResponse = await createMidtransTransaction(orderId, price, payment_method);

    if (paymentResponse.status_code !== '201') {
        return res.status(500).json({ error: 'Payment processing failed' });
    }

    // Insert transaction history into your database
    await db.execute(
        'INSERT INTO icafe_transactions (billing_price_id, userid, payment_method, time, date) VALUES (?, ?, ?, NOW(), NOW())',
        [billing_price_id, user_id, payment_method]
    );

    // Fetch the inserted icafe_transaction_id
    const [transactionResult] = await db.execute(
        'SELECT LAST_INSERT_ID() as icafe_transaction_id'
    );

    const { icafe_transaction_id } = transactionResult[0];

    // Update the appropriate billing column in the accounts table by adding hours
    await dbToUse(icafe_id).execute(
        `UPDATE accounts SET ${billingColumn} = ADDTIME(${billingColumn}, SEC_TO_TIME(? * 3600)) WHERE account_id = ?`,
        [hours, account_id]
    );

    await insertICafeBillingHistory(icafe_transaction_id, user_id, billing_price_id);

    res.json({ message: 'Payment successful', paymentResponse });
} catch (error) {
    console.error('Error in topupBilling:', error.message);
    res.status(500).json({ error: 'Transaction failed' });
}
});


router.post('/topupEwallet', async (req, res) => {
const { user_id, topup_amount, payment_method } = req.body;

try {
  // Check if user_id and topup_amount are provided and topup_amount is a number
  if (!user_id || !topup_amount || isNaN(topup_amount)) {
    return res.status(400).json({ error: 'Invalid input data. Please provide user_id, topup_amount (as a number), and payment_method.' });
  }

  const orderId = uuidv4(); // Generate a unique order ID

  // Create transaction in Midtrans (assuming this is where you handle payment processing)
  const paymentResponse = await createMidtransTransaction(orderId, topup_amount, payment_method);

  if (paymentResponse.status_code !== '201') {
    return res.status(500).json({ error: 'Payment processing failed' });
  }

  // Insert topup record into ewallet_transactions table
  const [insertEWalletResult] = await db.execute(
    'INSERT INTO ewallet_transactions (userid, topup_amount, payment_method, time, date) VALUES (?, ?, ?, NOW(), NOW())',
    [user_id, topup_amount, payment_method]
);
  
  if (insertEWalletResult.affectedRows !== 1) {
    throw new Error('Failed to insert topup record into ewallet_transactions');
  }

  const [transactionResult] = await db.execute(
    'SELECT LAST_INSERT_ID() as ewallet_transaction_id'
);

    const { ewallet_transaction_id } = transactionResult[0];

  // Fetch current ewallet_balance
  const [userBalanceResult] = await db.execute('SELECT ewallet_balance FROM icafe_users WHERE userid = ?', [user_id]);
  
  if (userBalanceResult.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const currentBalance = userBalanceResult[0].ewallet_balance;
  const newBalance = currentBalance + topup_amount; // Add the topup_amount to existing balance

  // Update ewallet_balance in icafe_users table
  await db.execute('UPDATE icafe_users SET ewallet_balance = ? WHERE userid = ?', [newBalance, user_id]);

  await insertEwalletTopupHistory(ewallet_transaction_id, user_id);

  res.json({ message: 'eWallet top-up successful' });
} catch (error) {
  console.error('Error in eWallet top-up:', error.message);
  res.status(500).json({ error: 'Transaction failed' });
}
});

module.exports = router;