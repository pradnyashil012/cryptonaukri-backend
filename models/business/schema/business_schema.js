const mongoose = require('mongoose')

const business_schema = mongoose.model('business_schema', {

    name: {
        type: String,
        require: true,
    },
    officialemail: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    companyname: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true,
    },
    estyear: {
        type: String,
        require: true,
    },
    gstin: {
        type: String,
        require: false,
    },
    headquarters: {
        type: String,
        require: true,
    },
    phonenumber: {
        type: String,
        require: true,
    },
    websitelink: {
        type: String,
        require: true,
    },
    isVerified: {
        type: Boolean,

    },
    otp: {
        type: String,
    }

})

module.exports = business_schema