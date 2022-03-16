const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    usersApplied: [{
        type : mongoose.Schema.Types.ObjectId ,
        ref : "userAnswers"
    }],
    postedBy : {
      type : mongoose.Schema.Types.ObjectId,
      ref : "business"
    },
    postedOn : {
        type : Date ,
        default:  Date.now()
    },
    isActive : {
      type : Boolean ,
      default : true
    },
    jobTitle: {
        type: String,
        require: true,
    },
    locationType: {
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
        type: Number,
    },
    experience: {
        type: Number,
        require: true,
    },
    jobDescription: {
        type: String,
        require: true,
    },
    ctc: {
        type: String,
        require: true,
    },
    fixedPay: {
        type: String,
        require: true,
    },
    variablePay: {
        type: String,
        require: true,
    },
    incentives: {
        type: String,
        require: true,
    },
    probationPeriod: {
        type: String,
        require: true,
    },
    probationDuration: {
        type: String,
        require: true,
    },
    probationSalary: {
        type: String,
        require: true,
    },
    perks: [{
        type : String
    }],
    fiveDaysWeek: {
        type: Boolean,
        require: true,
    },
    transportation: {
        type: String,
        require: true,
    },
    informalDress: {
        type: String,
        require: true,
    },
    healthInsurance: {
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
    candidatePreferences: {
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
});

module.exports = mongoose.model("jobSchema",Schema);
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