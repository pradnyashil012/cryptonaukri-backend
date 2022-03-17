const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    userAssociated :  {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
    },
    jobAssociated : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "jobSchema",
    },
    whyHire: {
        type: String,
        default : null
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

module.exports = mongoose.model("userAnswers",Schema);