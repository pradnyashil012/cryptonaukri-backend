const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    executiveName: {
        type: String,
        require: true,
    },
    officialEmail: {
        type: String,
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
    estYear: {
        type: String,
        require: true,
    },
    GSTIN: {
        type: String,
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
});

module.exports = mongoose.model("business",Schema);