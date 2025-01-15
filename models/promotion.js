const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    code: { type: String },
    discount: { type: Number, required: true },
    minCount: { type: Number, default: 0 },
    usageLimit: { type: Number, default: 1 },
    image: { type: String, required: false },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    display: { type: String, enum: ['Show', 'Hide'], default: 'Hide' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Promotion', promotionSchema);
