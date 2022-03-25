const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    coupon : {
        type : String ,
        unique : true
    },
    businessAssociated : {
        type : String ,
        default : null
    }
});

module.exports = mongoose.model("businessCoupon",schema);