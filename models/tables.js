const mongoose = require('mongoose');


const TableSchema = new mongoose.Schema({
    tableName:{
        type:String,
        required:true
    },
    x:{
        type:Number,
        default:0
    },
    y:{
        type:Number,
        default:0
    },
    restaurant_id:{
        type:mongoose.Types.ObjectId, ref: "Restaurant",
        required:true
    },status:{
        type:String,
        default:"not available"
    }
},{timestamps:true})


module.exports = mongoose.model('Table',TableSchema)

