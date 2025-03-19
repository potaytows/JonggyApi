var express = require('express');
var router = express.Router();
const WalletModel = require('../models/wallet');
const multer = require('multer');
const fs = require('fs');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/saveProofImage', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        const imageBase64 = req.file.buffer.toString('base64');
        const withdrawId = req.body.withdrawId;
        const withdraw = await WalletModel.findOne({ 'wallet.withdrawals._id': withdrawId });

        if (!withdraw) {
            return res.status(404).json({ message: 'Withdrawal not found' });
        }

        const withdrawalIndex = withdraw.wallet.withdrawals.findIndex(w => w._id.toString() === withdrawId);
        if (withdrawalIndex === -1) {
            return res.status(404).json({ message: 'Withdrawal not found' });
        }

        withdraw.wallet.withdrawals[withdrawalIndex].proofImage = imageBase64;
        withdraw.wallet.withdrawals[withdrawalIndex].status = 'approved';
        await withdraw.save();

        res.status(201).json({ message: 'Proof image saved successfully', wallet: withdraw });
    } catch (error) {
        console.error('Error saving proof image:', error);
        res.status(500).json({ message: 'Error saving proof image', error: error.message });
    }
});


router.get('/withdrawalsRestaurants', async (req, res) => {
    try {
        const wallets = await WalletModel.find()
            .populate('restaurant_id', 'restaurantName')
            .populate('restaurant_id')
            .select('restaurant_id wallet.withdrawals');

        const withdrawalsList = wallets.map(wallet => ({
            restaurantName: wallet.restaurant_id?.restaurantName || "ไม่พบชื่อร้าน",
            withdrawals: wallet.wallet.withdrawals
        }));

        res.json(withdrawalsList);
    } catch (error) {
        console.error('Error fetching withdrawals:', error);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
});
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
router.post('/withdraw', async (req, res) => {
    const { restaurant_id, amount,bankName,accountName,accountNumber } = req.body;

    try {
        const wallet = await WalletModel.findOne({ restaurant_id });

        if (!wallet) return res.status(404).json({ message: "ไม่พบกระเป๋าเงิน" });

        if (amount > wallet.wallet.balance) {
            return res.status(400).json({ message: "จำนวนเงินเกินจากยอดคงเหลือ" });
        }

        wallet.wallet.balance -= amount;
        wallet.wallet.withdrawals.push({ amount,bankName,accountName,accountNumber, status: "pending" });
        await wallet.save();

        return res.status(200).json({ message: "คำขอถอนเงินถูกส่งเรียบร้อยแล้ว" });
    } catch (error) {
        return res.status(500).json({ message: "เกิดข้อผิดพลาด", error });
    }
});


module.exports = router;