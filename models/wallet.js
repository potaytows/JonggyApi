const mongoose = require('mongoose');


const WalletSchema = new mongoose.Schema({
    restaurant_id: {
        type: mongoose.Types.ObjectId, ref: "Restaurant",
        required: true
    },
    bankAccount: [{
        bankName: { type: String, required: true },
        accountName: { type: String, required: true },
        accountNumber: { type: String, required: true },
    }],
    wallet: {
        balance: { type: Number, default: 0 }, // ยอดเงินในกระเป๋า
        transactions: [{
            amount: { type: Number, required: true }, // จำนวนเงินก่อนหักภาษี
            netAmount: { type: Number, required: true }, // จำนวนเงินหลังหักภาษี
            date: { type: Date, default: Date.now }
        }],
        withdrawals: [{
            amount: { type: Number, required: true }, // จำนวนเงินที่ถอน
            status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }, // สถานะการถอน
            date: { type: Date, default: Date.now },
            proofImage: { type: String, default: null },
            bankName: { type: String, required: true },
            accountName: { type: String, required: true },
            accountNumber: { type: String, required: true },
        }]
    }

}, { timestamps: true })


module.exports = mongoose.model('Wallet', WalletSchema)

