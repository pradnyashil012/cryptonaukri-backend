const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    executiveName: {
        type: String,
        require: true,
    },
    officialEmail: {
        type: String,
        unique : true,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    companyName: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true,
    },
    establishedYear: {
        type: String,
        require: true,
    },
    GSTIN: {
        type: String,
        default : null
    },
    headquarters: {
        type: String,
        require: true,
    },
    phoneNumber: {
        type: String,
        require: true,
    },
    websiteLink: {
        type: String,
    },
    ROLE : {
        type : String ,
        default : "BUSINESS"
    }
});

module.exports = mongoose.model("business",Schema);