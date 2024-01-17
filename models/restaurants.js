const mongoose = require('mongoose');


const RestaurantSchema = new mongoose.Schema({
    restaurantName:{
        type:String,
        required:true
    },
    description:{
        type:String,default:"Looks like this restaurant hasn't put any description yet..."
    },owner:{
        type:String
    },status:{
        type:String,
        default:'closed'
    }
    

},{timestamps:true})


module.exports = mongoose.model('Restaurant',RestaurantSchema)

