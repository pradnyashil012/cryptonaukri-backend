const mongoose = require('mongoose')

const job_schema = mongoose.model('job_schema', {

    position: {
        type: String,
    },

    company: {
        type: String,
    },

    experience: {
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

module.exports = job_schema