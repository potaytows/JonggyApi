const mongoose = require('mongoose');


const TableSchema = new mongoose.Schema({
    text: {
        type: String,
    },
    x: {
        type: Number,
        default: 160
    },
    y: {
        type: Number,
        default: 220
    },
    restaurant_id: {
        type: mongoose.Types.ObjectId, ref: "Restaurant",
        required: true
    }, status: {
        type: String,
        default: ""
    },
    type:{
        type:String,
        default:""
    },height:{
        type:Number,
    },width:{
        type:Number,
    },shapeType:{
        type:String,
    },color:{
        type:String,
        default:'#ff8a24'
    }
}, { timestamps: true })






module.exports = mongoose.model('Table', TableSchema)
