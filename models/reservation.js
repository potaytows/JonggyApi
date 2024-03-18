const mongoose = require('mongoose');


const CartSchema = new mongoose.Schema({
    selectedTables:[{
        type: mongoose.Types.ObjectId, ref: "Table",
    }],
    selectedMenuItem: [{
        type: mongoose.Types.ObjectId, ref: "Menu",
    }],
    selectedAddons:[{
        type: mongoose.Types.ObjectId, ref: "Addon",
    }] ,
    OrderTableType: {
        type: String,
        required: true
    },
    totalPrice: {
        type: Number,
        default: 0
    }

});


const reservationSchema = new mongoose.Schema({
    username: {
        type: String

    },
    reservedTables:[{
        type: mongoose.Types.ObjectId, ref: "Table",
    }],
    orderedFood:{
        type:[CartSchema]

    },status:{
        type:String,
        default:"pending"
    },restaurant_id:{
        type: mongoose.Types.ObjectId, ref: "Restaurant",
    },total:{
        type:Number,
    }

},{timestamps:true});

module.exports = mongoose.model('Reservation', reservationSchema);


