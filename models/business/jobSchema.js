const mongoose = require("mongoose");
const Schema = new mongoose.Schema({
    usersApplied: [{
        type : mongoose.Schema.Types.Object ,
        ref : "userAnswers"
    }],
    postedBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "business",
        unique : false
    },
    postedByDetails : {
        executiveName : String,
        officialEmail : String ,
        companyName : String ,
        websiteLink : String ,
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
    isContract: {
        type: Boolean,
        default : false
    },
    durationOfContract : {
        type : String
    },
    location: {
        type: String,
        require: true,
    },
    openings: {
        type: Number,
        require : true
    },
    experience: {
        type: String,
        require: true,
    },
    jobDescription: {
        type: String,
        require: true,
    },
    ctc: {
        type: Number,
        require: true,
    },
    fixedPay: {
        type: Number,
        require: true,
    },
    variablePay: {
        type: Number,
    },
    incentives: {
        type: Boolean,
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
        type: Number,
        require: true,
    },
    perks: [{
        type : String
    }],
    fiveDaysWeek: {
        type: Boolean,
        require: true,
    },
    isRemote : {
      type : Boolean
    },
    transportation: {
        type: String,
        require: true,
    },
    informalDress: {
        type: Boolean,
        require: true,
    },
    healthInsurance: {
        type: Boolean,
    },
    snacks: {
        type: Boolean,
    },
    skills: [{
        type : String
    }],
    candidatePreferences: {
        type: String,
    },
    status: {
        type: String,
    },
    isDisabled : {
        type : Boolean ,
        default : false
    },
    hasBeenApproved : {
        type : Boolean ,
        default : false
    }
});

module.exports = mongoose.model("jobSchema",Schema);
