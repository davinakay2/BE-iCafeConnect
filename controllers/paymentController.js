const express = require("express"),
router = express.Router();

const bodyParser = require('body-parser');
const service = require("../services/paymentServices");
const app = express();

app.use(bodyParser.json());

app.post('/create-payment', async (req, res) => {
  const { orderId, grossAmount, customerDetails } = req.body;

  const transactionData = {
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount,
    },
    customer_details: customerDetails,
    item_details: [
      {
        id: 'item01',
        price: grossAmount,
        quantity: 1,
        name: 'Item Name',
      },
    ],
  };

  try {
    const response = await service.post('/charge', transactionData);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Payment creation failed' });
  }
});

app.post('/payment-notification', async (req, res) => {
    const notification = req.body;
  
    // You can validate the notification here (e.g., by checking the signature)
    console.log('Payment notification received:', notification);
  
    // Process the notification (update order status, etc.)
    // Example: Update order status based on notification.transaction_status
  
    res.status(200).send('OK');
  });

module.exports = router;

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });