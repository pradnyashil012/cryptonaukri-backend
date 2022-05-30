const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    userAssociated :  {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
    },
    userDetails : {
        firstName : String,
        lastName : String,
        email : String ,
        resumeLink : {
            type : String ,
            default : null
        }
    },
    jobAssociated : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "jobSchema",
    },
    jobDetails : {
        jobTitle : String ,
        jobDescription : String
    },
    whyHire: {
        type: String,
        default : null
    },
    candidateAvailability : {
        type : String ,
        default : null
    },
    isDisabled : {
        type : Boolean ,
        default : false
    },
    applicationStatus : {
      type : String,
      default : "SUBMITTED"
    },
    appliedOn : {
        type : Date ,
        default : Date.now()
    }
});

module.exports = mongoose.model("userAnswers",Schema);