const mongoose = require('mongoose');


const RestaurantSchema = new mongoose.Schema({
    restaurantName:{
        type:String,
        required:true
    },
    description:{
        type:String,default:"หลังมอ"
    },owner:{
        type:String
    },status:{
        type:String,
        default:'closed'
    },restaurantIcon:{
        data:Buffer,
        contentType:String
    }
    

},{timestamps:true})


module.exports = mongoose.model('Restaurant',RestaurantSchema)

