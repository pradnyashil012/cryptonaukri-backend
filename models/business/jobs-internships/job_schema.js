const mongoose = require('mongoose')

const job_schema = mongoose.model('job_schema', {

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
    contract: {
        type: String,
        require: true,
    },
    location: {
        type: String,
        require: true,
    },
    openings: {
        type: String,
        require: false,
    },
    experince: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true,
    },
    ctc: {
        type: String,
        require: true,
    },
    fixedpay: {
        type: String,
        require: true,
    },
    variablepay: {
        type: String,
        require: true,
    },
    incentives: {
        type: String,
        require: true,
    },
    probationperiod: {
        type: String,
        require: true,
    },
    probationduration: {
        type: String,
        require: true,
    },
    probationsalary: {
        type: String,
        require: true,
    },
    perks: {
        type: String,
        require: true,
    },
    fivedaysweek: {
        type: String,
        require: true,
    },
    transportation: {
        type: String,
        require: true,
    },
    informaldress: {
        type: String,
        require: true,
    },
    healthinsurance: {
        type: String,
        require: true,
    },
    snacks: {
        type: String,
        require: true,
    },
    skills: {
        type: [String],
        require: true,
    },
    candidatepreferences: {
        type: String,
        require: true,
    },
    whyhire: {
        type: String,
        require: true,
    },
    question: {
        type: String,
        require: true,
    },
    status: {
        type: String,
        require: true,
    },





})

module.exports = job_schema

/*
 "title": "fo",
 "locationtype": "fo",
 "contract": "fo",
 "location": "fo",
 "openings": "fo",
 "experince": "fo",
 "description": "fo",
 "ctc": "fo",

 "fixedpay": "fo",
 "variablepay": "fo",
 "incentives": "fo",
 "probationperiod": "fo",
 "probationduration": "fo",
 "probationsalary": "fo",
 "perks": "fo",

 "fivedaysweek": "fo",
 "transportation": "fo",
 "informaldress": "fo",
 "healthinsurance": "fo",
 "snacks": "fo",
 "skills": "fo",
 "candidatepreferences": "fo",
 "whyhire": "fo",

 "question": "fo",
 "status": "fo",




*/