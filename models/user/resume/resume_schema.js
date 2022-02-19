const mongoose = require('mongoose')

const resume_schema = mongoose.model('resume_schema', {

    user_id: {
        type: String
    },
    education: {
        type: [String]
    },
    jobs: {
        type: [String]
    },
    internships: {
        type: [String]
    },
    training: {
        type: [String]
    },
    projects: {
        type: [String]
    },
    skills: {
        type: [String]
    }

})

module.exports = resume_schema