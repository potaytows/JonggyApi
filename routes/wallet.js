var express = require('express');
var router = express.Router();
const WalletModel = require('../models/wallet');


router.get('/getwallet/:restaurant_id', async (req, res) => {
    try {
        const { restaurant_id } = req.params;
        const wallet = await WalletModel.findOne({ restaurant_id }).exec();
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found for this restaurant' });
        }
        res.status(200).json(wallet);
    } catch (error) {
        console.error('Error fetching wallet:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/addBankAccount', async (req, res) => {
    try {
        const { restaurant_id, bankName, accountName, accountNumber } = req.body;

        if (!restaurant_id || !bankName || !accountName || !accountNumber) {
            return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }
        let wallet = await WalletModel.findOne({ restaurant_id });

        if (!wallet) {
            wallet = new WalletModel({
                restaurant_id,
                bankAccount: [{ bankName, accountName, accountNumber }],
                wallet: { balance: 0 }
            });
        } else {
            wallet.bankAccount.push({ bankName, accountName, accountNumber });
        }

        await wallet.save();
        res.status(201).json({ message: 'เพิ่มบัญชีธนาคารสำเร็จ', data: wallet.bankAccount });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึก' });
    }
});


module.exports = router;