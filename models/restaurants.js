const mongoose = require('mongoose');


const RestaurantSchema = new mongoose.Schema({
    restaurantName:{
        type:String,
        required:true
    },
    description:{
        type:String,default:"หลังมอ"
    },owner:{
        type:mongoose.Types.ObjectId, ref: "User"
    },status:{
        type:String,
        default:'closed'
    }
    

},{timestamps:true})


module.exports = mongoose.model('Restaurant',RestaurantSchema)

