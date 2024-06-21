const { db, db1, db2, db3 } = require("../db");

const insertICafeBillingHistory = async (transactionId, userId, billingPriceId) => {
    try {
        // Fetch additional details from the database
        const [billingResults] = await db.execute(
            'SELECT price, icafe_detail_id, hours FROM billing_price WHERE billing_price_id = ?',
            [billingPriceId]
        );

        const { price, icafe_detail_id, hours } = billingResults[0];

        const [icafeResults] = await db.execute(
            'SELECT icafe_id, pc_category FROM icafe_details WHERE icafe_detail_id = ?',
            [icafe_detail_id]
        );

        const { icafe_id, pc_category } = icafeResults[0];

        const [icafeInfoResults] = await db.execute(
            'SELECT name FROM icafe_info WHERE icafe_id = ?',
            [icafe_id]
        );

        const { name: icafeName } = icafeInfoResults[0];

        // Fetch the payment method from icafe_transactions table
        const [transactionResults] = await db.execute(
            'SELECT payment_method FROM icafe_transactions WHERE icafe_transaction_id = ?',
            [transactionId]
        );

        if (transactionResults.length === 0) {
            throw new Error('Transaction not found');
        }

        const { payment_method } = transactionResults[0];

        // Insert the transaction history record
        await db.execute(
            'INSERT INTO icafe_billing_history (icafe_transaction_id, userid, icafe_name, date, hours, pc_category, payment_method, price) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?)',
            [transactionId, userId, icafeName, hours, pc_category, payment_method, price]
        );
    } catch (error) {
        console.error('Error recording iCafe billing history:', error.message);
    }
};

const insertEwalletTopupHistory = async (transactionId, userId) => {
    try {
        // Fetch the transaction details from ewallet_transactions table
        const [transactionResults] = await db.execute(
            'SELECT topup_amount, payment_method FROM ewallet_transactions WHERE ewallet_transaction_id = ?',
            [transactionId]
        );

        if (transactionResults.length === 0) {
            throw new Error('Transaction not found');
        }

        const { topup_amount, payment_method } = transactionResults[0];

        // Insert the transaction history record
        await db.execute(
            'INSERT INTO ewallet_topup_history (ewallet_transaction_id, userid, date, topup_amount, payment_method) VALUES (?, ?, NOW(), ?, ?)',
            [transactionId, userId, topup_amount, payment_method]
        );
    } catch (error) {
        console.error('Error recording eWallet top-up history:', error.message);
    }
};

module.exports = {
    insertICafeBillingHistory,
    insertEwalletTopupHistory
};


