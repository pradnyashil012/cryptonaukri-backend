const mongoose = require('mongoose')

const internships_schema = mongoose.model('internships_schema', {

    user_id: {
        type: String,
    },
    title: {
        type: String,
        require: true,
    },
    locationType: {
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
    startDate: {
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

    amountType: {
        type: String,
        require: true,
    },
    currencyType: {
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
    letterOfRecommendation: {
        type: String,
        require: true,
    },
    workHours: {
        type: String,
        require: true,
    },
    dressCode: {
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
});

module.exports = internships_schema