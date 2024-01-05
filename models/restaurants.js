const mongoose = require('mongoose');


const RestaurantSchema = new mongoose.Schema({
    restaurantName:{
        type:String,
        required:true
    },
    description:{
        type:String,default:"Looks like this restaurant hasn't put any description yet..."
    },owner:{
        type:mongoose.Types.ObjectId, ref: "User"
    }
    

},{timestamps:true})


module.exports = mongoose.model('Restaurant',RestaurantSchema)

