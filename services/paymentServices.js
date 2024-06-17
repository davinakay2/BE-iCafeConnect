const {db, db2} = require("../db");
// const express = require("express"),
// router = express.Router();

const axios = require('axios');
const MIDTRANS_SERVER_KEY = 'SB-Mid-server-5tUI83BL312O5PCWT4FbLPrP';

const midtransClient = axios.create({
  baseURL: 'https://api.sandbox.midtrans.com/v2', // Use 'https://api.midtrans.com/v2' for production
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + Buffer.from(MIDTRANS_SERVER_KEY).toString('base64'),
  },
});

module.exports = midtransClient;

// module.exports = router;