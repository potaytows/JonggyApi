const mongoose = require('mongoose');
const TableSchema = new mongoose.Schema({
    text: {
        type: String,
    },
    x: {
        type: Number,
        default: 180
    },
    y: {
        type: Number,
        default: 210
    },
    restaurant_id: {
        type: mongoose.Types.ObjectId, ref: "Restaurant",
        required: true
    }, status: {
        type: String,
        default: "disabled"
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
})
const PresetSchema = new mongoose.Schema({
    presetName: {
        type: String,
    },
    restaurant_id: {
        type: mongoose.Types.ObjectId, ref: "Restaurant",
        required: true
    }, tables:[
        TableSchema
    ]
}, { timestamps: true })
module.exports = mongoose.model('Preset', PresetSchema)
