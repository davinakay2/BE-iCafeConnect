const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const {
  db,
  db1,
  db2,
  db3,
  getDatabaseById,
  getDatabaseNameById,
  allDatabaseNames,
} = require("../db");
const fs = require("fs");
const path = require("path");

const { createMidtransTransaction } = require("../services/paymentServices");

// Route handling function
router.post("/topupBilling", async (req, res) => {
  const { billing_price_id, payment_method, user_id, icafe_id } = req.body;
  console.log(req.body);
  try {
    // Check if user_id is provided
    if (user_id === undefined) {
      return res.status(400).json({ error: "userid is required" });
    }

    const selectedDb = getDatabaseById(icafe_id);

    // Fetch billing price details and icafe_detail_id from your database
    const [billingResults] = await selectedDb.execute(
      "SELECT price, icafe_detail_id, hours FROM billing_price WHERE billing_price_id = ?",
      [billing_price_id]
    );

    if (billingResults.length === 0) {
      return res.status(404).json({ error: "Billing option not found" });
    }

    const { price, icafe_detail_id, hours } = billingResults[0];

    // Fetch icafe_id and pc_category using icafe_detail_id
    const [icafeResults] = await selectedDb.execute(
      "SELECT pc_category FROM icafe_details WHERE icafe_detail_id = ?",
      [icafe_detail_id]
    );

    if (icafeResults.length === 0) {
      return res.status(404).json({ error: "iCafe details not found" });
    }

    const { pc_category } = icafeResults[0];

    // Fetch username_binding from the binding_account table
    const [bindingResults] = await db.execute(
      "SELECT username_binding FROM binding_account WHERE userid = ?",
      [user_id]
    );

    if (bindingResults.length === 0) {
      return res.status(404).json({ error: "Binding account not found" });
    }

    const { username_binding } = bindingResults[0];

    // Determine the appropriate database based on icafe_id
    // const dbToUse = (icafe_id) => {
    //   // Ensure icafe_id is treated as a number
    //   const id = Number(icafe_id);
    //   switch (id) {
    //     case 1:
    //       return db1;
    //     case 2:
    //       return db2;
    //     case 3:
    //       return db3;
    //     default:
    //       return db;
    //   }
    // };

    // Fetch username from the accounts table using username_binding
    const [accountResults] = await selectedDb.execute(
      "SELECT account_id FROM accounts WHERE username = ?",
      [username_binding]
    );

    if (accountResults.length === 0) {
      return res.status(404).json({ error: "Account not found" });
    }

    const { account_id } = accountResults[0];

    // Determine the billing column to update based on pc_category
    let billingColumn;
    switch (pc_category) {
      case "Regular":
        billingColumn = "regular_billing";
        break;
      case "VIP":
        billingColumn = "vip_billing";
        break;
      case "VVIP":
        billingColumn = "vvip_billing";
        break;
      default:
        return res.status(400).json({ error: "Invalid PC category" });
    }

    const orderId = uuidv4(); // Generate a unique order ID

    // Create transaction in Midtrans
    const paymentResponse = await createMidtransTransaction(
      orderId,
      price,
      payment_method
    );

    if (paymentResponse.status_code !== "201") {
      return res.status(500).json({ error: "Payment processing failed" });
    }

    // Insert transaction history into your database
    await db.execute(
      "INSERT INTO icafe_transactions (billing_price_id, user_id, payment_method, icafe_id, time, date) VALUES (?, ?, ?, ?, NOW(), NOW())",
      [billing_price_id, user_id, payment_method, icafe_id]
    );

    // Fetch the inserted icafe_transaction_id
    const [transactionResult] = await db.execute(
      "SELECT LAST_INSERT_ID() as icafe_transaction_id"
    );

    const { icafe_transaction_id } = transactionResult[0];

    // Update the appropriate billing column in the accounts table by adding hours
    await selectedDb.execute(
      `UPDATE accounts SET ${billingColumn} = ADDTIME(${billingColumn}, SEC_TO_TIME(? * 3600)) WHERE account_id = ?`,
      [hours, account_id]
    );

    // await insertICafeBillingHistory(icafe_transaction_id, user_id, billing_price_id);

    res.json({ message: "Payment successful", paymentResponse });
  } catch (error) {
    console.error("Error in topupBilling:", error.message);
    res.status(500).json({ error: "Transaction failed" });
  }
});

async function getTransactions(user_id, databaseName) {
  try {
    const [transactions] = await db.query(
      `SELECT it.icafe_transaction_id, ii.name, it.date, bp.hours, id.pc_category, bp.price, it.payment_method, ii.image_url, it.time
       FROM icafe_transactions it 
       JOIN ${databaseName}.billing_price bp ON it.billing_price_id = bp.billing_price_id
       JOIN ${databaseName}.icafe_details id ON bp.icafe_detail_id = id.icafe_detail_id
       JOIN icafe_info ii ON it.icafe_id = ii.icafe_id
       WHERE it.user_id = ?
       ORDER BY it.date ASC, it.time DESC;`,
      [user_id]
    );
    return transactions;
  } catch (error) {
    console.log("getTransaction error");
  }
}

router.get("/getTransactionBillingHistory", async (req, res) => {
  const user_id = req.query.user_id;
  try {
    // Get the list of database names
    const databaseNames = allDatabaseNames;

    // Fetch transactions from all databases
    const transactionsPromises = databaseNames.map((databaseName) =>
      getTransactions(user_id, databaseName)
    );

    const allTransactions = await Promise.all(transactionsPromises);

    const uniqueTime = new Set();
    const uniqueTransactions = [];

    allTransactions.forEach((transaction) => {
      const key = `${transaction.transaction_date}-${transaction.transaction_time}`;
      if (!uniqueTime.has(key)) {
        uniqueTime.add(key);
        uniqueTransactions.push(transaction);
      }
    });

    const distinctResults = Array.from(uniqueTransactions[0].values());

    const serverBaseUrl = "http://localhost:3000"; // Update with your server's base URL
    const formattedTransactions = distinctResults.map((transaction) => {
      if (transaction.image_url) {
        const imagePath = path.join(__dirname, "..", transaction.image_url);
        if (fs.existsSync(imagePath)) {
          const image = fs.readFileSync(imagePath);
          const base64Image = Buffer.from(image).toString("base64");
          return {
            ...transaction,
            image_url: `${serverBaseUrl}${transaction.image_url}`,
            image: base64Image,
          };
        } else {
          return {
            ...transaction,
            image_url: `${serverBaseUrl}${transaction.image_url}`,
            image: null,
          };
        }
      }
      return transaction;
    });

    res.json(formattedTransactions);
  } catch (error) {
    console.error(
      "Error in getting Transaction Billing History:",
      error.message
    );
    res.status(500).json({ error: "Get Transaction Billing History failed" });
  }
});

router.post("/topupEwallet", async (req, res) => {
  const { user_id, topup_amount, payment_method } = req.body;

  try {
    // Check if user_id and topup_amount are provided and topup_amount is a number
    if (!user_id || !topup_amount || isNaN(topup_amount)) {
      return res.status(400).json({
        error:
          "Invalid input data. Please provide user_id, topup_amount (as a number), and payment_method.",
      });
    }

    const orderId = uuidv4(); // Generate a unique order ID

    // Create transaction in Midtrans (assuming this is where you handle payment processing)
    const paymentResponse = await createMidtransTransaction(
      orderId,
      topup_amount,
      payment_method
    );

    if (paymentResponse.status_code !== "201") {
      return res.status(500).json({ error: "Payment processing failed" });
    }

    // Insert topup record into ewallet_transactions table
    const [insertEWalletResult] = await db.execute(
      "INSERT INTO ewallet_transactions (userid, topup_amount, payment_method, time, date) VALUES (?, ?, ?, NOW(), NOW())",
      [user_id, topup_amount, payment_method]
    );

    if (insertEWalletResult.affectedRows !== 1) {
      throw new Error(
        "Failed to insert topup record into ewallet_transactions"
      );
    }

    const [transactionResult] = await db.execute(
      "SELECT LAST_INSERT_ID() as ewallet_transaction_id"
    );

    const { ewallet_transaction_id } = transactionResult[0];

    // Fetch current ewallet_balance
    const [userBalanceResult] = await db.execute(
      "SELECT ewallet_balance FROM icafe_users WHERE userid = ?",
      [user_id]
    );

    if (userBalanceResult.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentBalance = userBalanceResult[0].ewallet_balance;
    const newBalance = currentBalance + topup_amount; // Add the topup_amount to existing balance

    // Update ewallet_balance in icafe_users table
    await db.execute(
      "UPDATE icafe_users SET ewallet_balance = ? WHERE userid = ?",
      [newBalance, user_id]
    );

    // await insertEwalletTopupHistory(ewallet_transaction_id, user_id);

    res.json({ message: "eWallet top-up successful" });
  } catch (error) {
    console.error("Error in eWallet top-up:", error.message);
    res.status(500).json({ error: "Transaction failed" });
  }
});

router.post("/topupBillingWithEwallet", async (req, res) => {
  const { billing_price_id, user_id, icafe_id } = req.body;
  console.log("topupBillingWithEwallet", req.body);

  try {
    // Check if user_id is provided
    if (user_id === undefined) {
      return res.status(400).json({ error: "user_id is required" });
    }

    const selectedDb = getDatabaseById(icafe_id);

    // Fetch billing price details and icafe_detail_id from your database
    const [billingResults] = await selectedDb.execute(
      "SELECT price, icafe_detail_id, hours FROM billing_price WHERE billing_price_id = ?",
      [billing_price_id]
    );

    if (billingResults.length === 0) {
      return res.status(404).json({ error: "Billing option not found" });
    }

    const { price, icafe_detail_id, hours } = billingResults[0];

    // Fetch icafe_id and pc_category using icafe_detail_id
    const [icafeResults] = await selectedDb.execute(
      "SELECT pc_category FROM icafe_details WHERE icafe_detail_id = ?",
      [icafe_detail_id]
    );

    if (icafeResults.length === 0) {
      return res.status(404).json({ error: "iCafe details not found" });
    }

    const { pc_category } = icafeResults[0];

    // Fetch username_binding from the binding_account table
    const [bindingResults] = await db.execute(
      "SELECT username_binding FROM binding_account WHERE userid = ?",
      [user_id]
    );

    if (bindingResults.length === 0) {
      return res.status(404).json({ error: "Binding account not found" });
    }

    const { username_binding } = bindingResults[0];

    // Fetch username from the accounts table using username_binding
    const [accountResults] = await selectedDb.execute(
      "SELECT account_id FROM accounts WHERE username = ?",
      [username_binding]
    );

    if (accountResults.length === 0) {
      return res.status(404).json({ error: "Account not found" });
    }

    const { account_id } = accountResults[0];

    // Fetch the user's e-wallet balance
    const [userResults] = await db.execute(
      "SELECT ewallet_balance FROM icafe_users WHERE userid = ?",
      [user_id]
    );

    if (userResults.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const { ewallet_balance } = userResults[0];

    // Check if the user has sufficient balance
    if (ewallet_balance < price) {
      return res.status(402).json({ error: "Insufficient e-wallet balance" });
    }

    // Deduct the price from the user's e-wallet balance
    await db.execute(
      "UPDATE icafe_users SET ewallet_balance = ewallet_balance - ? WHERE userid = ?",
      [price, user_id]
    );

    // Insert transaction into icafe_transactions
    await db.execute(
      "INSERT INTO icafe_transactions (billing_price_id, user_id, payment_method, icafe_id, time, date) VALUES (?, ?, ?, ?, NOW(), NOW())",
      [billing_price_id, user_id, "e-wallet", icafe_id]
    );

    // Fetch the inserted icafe_transaction_id
    const [transactionResult] = await db.execute(
      "SELECT LAST_INSERT_ID() as icafe_transaction_id"
    );

    const { icafe_transaction_id } = transactionResult[0];

    // Determine the billing column to update based on pc_category
    let billingColumn;
    switch (pc_category) {
      case "Regular":
        billingColumn = "regular_billing";
        break;
      case "VIP":
        billingColumn = "vip_billing";
        break;
      case "VVIP":
        billingColumn = "vvip_billing";
        break;
      default:
        return res.status(400).json({ error: "Invalid PC category" });
    }

    // Update the appropriate billing column in the accounts table by adding hours
    await selectedDb.execute(
      `UPDATE accounts SET ${billingColumn} = ADDTIME(${billingColumn}, SEC_TO_TIME(? * 3600)) WHERE account_id = ?`,
      [hours, account_id]
    );

    // Optionally, you can call a function to log this transaction into a history table
    // await insertICafeBillingHistory(icafe_transaction_id, user_id, billing_price_id);

    res.json({ message: "Payment successful" });
  } catch (error) {
    console.error("Error in topupBillingEwallet:", error.message);
    res.status(500).json({ error: "Transaction failed" });
  }
});

async function getTransactionsEWallet(user_id, databaseName) {
  try {
    const [transactions] = await db.query(
      `SELECT 
        ii.name AS icafe_name,
        it.date AS transaction_date,
        it.time AS transaction_time,
        bp.price AS price,
        it.payment_method
        FROM 
            icafe_transactions it
        JOIN 
            ${databaseName}.billing_price bp ON it.billing_price_id = bp.billing_price_id
        JOIN 
            icafe_info ii ON it.icafe_id = ii.icafe_id
        WHERE 
            it.payment_method = 'e-wallet'
        AND 
            it.user_id = ?

        UNION ALL

        SELECT 
            '' AS icafe_name,
            et.date AS transaction_date,
            et.time AS transaction_time,
            et.topup_amount AS price,
        payment_method
        FROM 
            ewallet_transactions et
        WHERE 
            et.userid = ?

        ORDER BY 
            transaction_date DESC, transaction_time DESC;`,
      [user_id, user_id]
    );
    return transactions;
  } catch (error) {
    console.log("getTransaction error");
  }
}

router.get("/getEWalletTransactionHistory", async (req, res) => {
  const user_id = req.query.user_id;
  console.log(user_id);

  try {
    const databaseNames = allDatabaseNames;

    // Fetch transactions from all databases
    const transactionsPromises = databaseNames.map((databaseName) =>
      getTransactionsEWallet(user_id, databaseName)
    );

    const allTransactions = await Promise.all(transactionsPromises);

    // Create a Set to keep track of unique prices
    const uniqueTime = new Set();
    const uniqueTransactions = [];

    allTransactions.forEach((transaction) => {
      const key = `${transaction.transaction_date}-${transaction.transaction_time}`;
      if (!uniqueTime.has(key)) {
        uniqueTime.add(key);
        uniqueTransactions.push(transaction);
      }
    });

    const distinctResults = Array.from(uniqueTransactions[0].values());

    res.json(distinctResults);
  } catch (error) {
    console.error(
      "Error in getting E-Wallet Transaction History:",
      error.message
    );
    res.status(500).json({ error: "Get E-Wallet Transaction History failed" });
  }
});

module.exports = router;
