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
        email : String
    },
    whyHire: {
        type: String,
        default : null
    },
    internshipDetails : {
        internshipTitle : String ,
        responsibilities: String ,
    },
    candidateAvailability : {
        type : String ,
        default : null
    },
    appliedOn : {
        type : Date ,
        default : Date.now()
    }
});

module.exports = mongoose.model("userAnswersInternship",Schema);