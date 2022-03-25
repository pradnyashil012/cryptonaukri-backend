const mongoose = require('mongoose')

const admin_schema = mongoose.model('admin_schema', {


    firstname: {
        type: String,
        require: true,
    },

    lastname: {
        type: String,
        require: true,
    },

    officialemail: {
        type: String,
        require: true,
        unique: true,
    },

    password: {
        type: String,
        require: true,

    },
    phonenumber: {
        type: String,
        require: true,
    },
    location: {
        type: String,
        require: true,
    },
    position: {
        type: String,
        require: true,
    },


})

module.exports = admin_schema