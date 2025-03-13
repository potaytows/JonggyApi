const mongoose = require('mongoose');


const RestaurantSchema = new mongoose.Schema({
    restaurantName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: "This restaurant hasn't put any description yet"
    }, owner: {
        type: String
    }, status: {
        type: String,
        default: 'closed'
    }, restaurantIcon: {
        data: Buffer,
        contentType: String
    },
    location: {
        address: { type: String, required: true, default: 'Unknown Address' },
        coordinates: {
            latitude: { type: Number, required: true, default: 0 }, 
            longitude: { type: Number, required: true, default: 0 } 
        }
    },
    activePreset:{
        type: mongoose.Types.ObjectId, ref: "Preset",
    },activeTime:{
        open:{
            type:Date
        },close:{
            type:Date
        }
    },hasPromotion:{
        type:Boolean
    },isRecomened:{
        type:Boolean
    }

}, { timestamps: true })


module.exports = mongoose.model('Restaurant', RestaurantSchema)

