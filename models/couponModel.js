const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    couponCode : {
        type : String ,
        unique : true
    },
    userAssociated : {
        type : String
    },
    referredUserEmail : [{
        type : String
    }]
});

module.exports = mongoose.model("coupon",Schema);
