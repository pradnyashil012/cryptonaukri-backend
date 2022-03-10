const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    otp : {
        type : Number,
        required : true
    },
    emailAssociated : String
});
module.exports = mongoose.model("otp",schema);