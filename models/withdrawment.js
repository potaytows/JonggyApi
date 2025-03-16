const mongoose = require('mongoose');


const RestaurantSchema = new mongoose.Schema({
    restaurant_id: {
        type: mongoose.Types.ObjectId, ref: "Restaurant",
        
    },amount:{
        type:Number
    },status:{
        type:String
    },Payment: [
        {
            transRef: {
                type: String,
                required: true
            },
            sender: [
                {
                    displayName: String,
                    name: String
                }
            ],
            receiver: [
                {
                    displayName: String,
                    name: String
                }
            ],
            transTime: {
                type: String,
                required: true
            },
            transDate: {
                type: String,
                required: true
            },
            amount: {
                type: String,
                required: true
            },
            status: {
                type: String,
                default: 'failed',
                required: true
            }
        }
    ], transfer_slip: {
        data: Buffer,
        contentType: String
    },
    
}, { timestamps: true })


module.exports = mongoose.model('Restaurant', RestaurantSchema)

