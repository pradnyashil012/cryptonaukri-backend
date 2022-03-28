const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    key : {
        type : String ,
        unique : true,
        required : true
    },
    userAssociated  : {
        type : String ,
        default : null
    }
});

module.exports = mongoose.model("adminKey",Schema);