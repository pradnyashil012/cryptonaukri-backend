const mongoose = require('mongoose')

const user_schema = mongoose.model('user_schema', {

    name: {
        type: String,
    },

    email: {
        type: String,
    },

    password: {
        type: String,
    }


})

module.exports = user_schema 