const mongoose = require('mongoose');

const HelpCenterFormSchema = new mongoose.Schema({
    reservationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reservation',
        required: true,
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        match: [/.+\@.+\..+/, 'Invalid email format'],
    },
    topic: {
        type: String,
        required: true,
    },
    details: {
        type: String,
        required: true,
        maxlength: 1500,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('HelpCenter', HelpCenterFormSchema);
