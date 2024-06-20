const axios = require('axios');

const MIDTRANS_SERVER_KEY = 'SB-Mid-server-5tUI83BL312O5PCWT4FbLPrP';
const MIDTRANS_API_URL = 'https://api.sandbox.midtrans.com/v2/charge';

async function createMidtransTransaction(orderId, grossAmount, paymentType) {
  const authHeader = Buffer.from(MIDTRANS_SERVER_KEY).toString('base64');
  
  const response = await axios.post(MIDTRANS_API_URL, {
    payment_type: paymentType,
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount
    }
  }, {
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
}

module.exports = { createMidtransTransaction };