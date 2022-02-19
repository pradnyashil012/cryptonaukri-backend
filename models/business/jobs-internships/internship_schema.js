const mongoose = require('mongoose')

const internships_schema = mongoose.model('internships_schema', {

    user_id: {
        type: String,
    },
    title: {
        type: String,
        require: true,
    },
    locationtype: {
        type: String,
        require: true,
    },
    location: {
        type: String,
        require: true,
    },

    openings: {
        type: Number,
        require: true,
    },
    startdate: {
        type: String,
        require: true,
    },
    duration: {
        type: String,
        require: false,
    },
    responsibilities: {
        type: String,
        require: true,
    },

    // Stipend

    amounttype: {
        type: String,
        require: true,
    },
    currencytype: {
        type: String,
        require: true,

    },
    amount: {
        type: Number,
        require: true,
    },

    // perks

    certificate: {
        type: String,
        require: true,
    },
    letterofrecommendation: {
        type: String,
        require: true,
    },
    workhours: {
        type: String,
        require: true,
    },
    dresscode: {
        type: String,
        require: true,
    },
    food: {
        type: String,
        require: true,
    },
    isPPO: {
        type: String,
        require: true,
    },
    skills: {
        type: [String],
        require: true,
    },
    question1: {
        type: String,
        require: true,
    },
    question2: {
        type: String,
        require: true,
    },
    status: {
        type: String,
        require: true,
    },


})

module.exports = internships_schema