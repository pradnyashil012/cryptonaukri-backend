const mongoose = require('mongoose')

const user_schema = mongoose.model('user_schema', {


    firstname: {
        type: String,
        require: true,
    },
    lastname: {
        type: String,
        require: true,
    },

    email: {
        type: String,
        require: true,
        unique: true,
    },
    phonenumber: {
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

    isVerified: {

        type: Boolean,


    },
    otp: {

        type: String,


    },
    job_id: {
        type: [String]
    },
    internship_id: {
        type: [String]
    }

})

module.exports = user_schema