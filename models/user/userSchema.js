const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        require: true,
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        require: true,
        unique: true,
    },
    phoneNumber: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    location: {
        type: String,
        require: true,
    },
    isDisabled: {
        type: Boolean,
        default : false
    },
    dateOfJoining : {
        type : Date,
        default : Date.now()
    },
    ROLE : {
        type : String,
        default : "USER"
    },
    communityRole : {
        type : String ,
        default : "GENERAL_USER"
    },
    diamondsCount : {
      type : Number ,
      default : 0
    },
    accountDisableDate : {
      type : Date ,
      default : Date.now() + 14 * 24 * 60 * 60 * 1000
    },
    couponCode : {
        type : String
    }
});

module.exports = mongoose.model("user",userSchema);
