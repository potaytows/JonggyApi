const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
    
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    birthday:{
        type:String,
        required:true,
    },
    phonenumber:{
        type:String,
        required:true
    },role:{
        type:String,
        default:"normal user"
    }
},{timestamps:true})


module.exports = mongoose.model('User',UserSchema)

