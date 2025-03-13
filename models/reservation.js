const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    selectedTables: [{
        type: mongoose.Types.ObjectId, ref: "Table",
    }],
    selectedMenuItem: [{
        type: mongoose.Types.ObjectId, ref: "Menu",
    }],
    selectedAddons: [{
        type: mongoose.Types.ObjectId, ref: "Addon",
    }],
    OrderTableType: {
        type: String,
        required: true
    },
    totalPrice: {
        type: Number,
        default: 0
    },
    Count: {
        type: Number,
        default: 1  // กำหนดค่าเริ่มต้นเป็น 1
    },
    username: {
        type: String,
        required: true
    },
    restaurantId: {
        type: mongoose.Types.ObjectId, ref: "Restaurant",
        required: true
    }
}, { timestamps: true });

const reservationSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    reservedTables: [{
        type: mongoose.Types.ObjectId, ref: "Table",
    }],
    orderedFood: [CartSchema],
    status: {
        type: String,
        default: "รอการยืนยัน"
    },
    statusCheckIn: {
        type: String,
        default: "checkIn"
    },
    restaurant_id: {
        type: mongoose.Types.ObjectId, ref: "Restaurant",
        required: true
    },
    total: {
        type: Number,
    },
    statusLocation: {
        type: String,
        default: 'hideLocation'
    },
    locationCustomer: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    Payment: [
        {
            transRef: {
                type: String,
                required: true
            },
            sender: [
                {
                    displayName: String,
                    name: String
                }
            ],
            receiver: [
                {
                    displayName: String,
                    name: String
                }
            ],
            transTime: {
                type: String,
                required: true
            },
            transDate: {
                type: String,
                required: true
            },
            amount: {
                type: String,
                required: true
            },
            status: {
                type: String,
                default: 'failed',
                required: true
            }
        }
    ], startTime: {
        type: Date
    }, endTime: {
        type: Date
    }, cancellation: {
        cancelledBy: {
            type: mongoose.Types.ObjectId, ref: "User",
        }, cancelledAt: {
            type: Date
        }
    }, approval: {
        cancelledBy: {
            type: String,
        }, cancelledAt: {
            type: Date
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
