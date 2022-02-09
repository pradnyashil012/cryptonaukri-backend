const mongoose = require('mongoose')

const admin_schema = mongoose.model('admin_schema', {

    name: {
        type: String,
    },

    email: {
        type: String,
    },

    password: {
        type: String,
    },


})

module.exports = admin_schema