const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    userAssociated : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    },
    internshipAssociated  : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "internshipSchema"
    },
    userDetails : {
        firstName : String,
        lastName : String,
        email : String,
        resumeLink : {
            type : String ,
            default : null
        }
    },
    whyHire: {
        type: String,
        default : null
    },
    internshipDetails : {
        internshipTitle : String ,
        responsibilities: String ,
    },
    isDisabled : {
        type : Boolean ,
        default : false
    },
    candidateAvailability : {
        type : String ,
        default : null
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

module.exports = mongoose.model("userAnswersInternship",Schema);