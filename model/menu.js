const mongoose = require('mongoose')

const menuSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    url:{
        type:String,
        required:true
    }
})

const Menu = mongoose.model('menus',menuSchema)
module.exports = Menu