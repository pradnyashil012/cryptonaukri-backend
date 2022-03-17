const mongoose = require('mongoose');

const resume_schema = mongoose.model('resume_schema', {
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref : "user"
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