const mongoose = require('mongoose')

const internship_schema = mongoose.model('internship_schema', {

    position: {
        type: String,
    },

    company: {
        type: String,
    },

    openings: {
        type: String,
    },
    link: {
        type: String,
    },
    date:{
        type : Date,
    }
})

module.exports = internship_schema