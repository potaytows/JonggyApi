var express = require('express');
var router = express.Router();
var multer = require('multer');
var axios = require('axios');
var path = require('path');
var FormData = require('form-data');


var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

router.post('/createQRpayment', async (req, res) => {
    const { amount } = req.body;
    const qrCodeUrl = `https://promptpay.io/0637260082/${amount}`;
    res.json({ qrCodeUrl });
    console.log(amount);
});


module.exports = router;
