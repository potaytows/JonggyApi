const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Types.ObjectId, ref: "Restaurant",
        required: true
    },
    selectedTables: [
        {
            _id: String,
            tableName: String
        }
    ],
    selectedMenuItem: {
        _id: String,
        menuName: String,
        price: Number,
        Count: Number
    },
    selectedAddons: [
        {
            _id: String,
            AddOnName: String,
            price: Number
        }
    ],
    OrderTableType: {
        type: String,
        required: true
    },
    totalPrice: {
        type: Number,
        default: 0
    }

});

const CartModel = mongoose.model('Cart', CartSchema);



module.exports = CartModel;
