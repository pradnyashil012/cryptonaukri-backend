const mongoose = require("mongoose");
const Schema = new mongoose.Schema({
    usersApplied : [{
        type : mongoose.Schema.Types.Object,
        ref : "userAnswersInternship"
    }],
    postedBy : {
      type : mongoose.Schema.Types.ObjectId,
      ref : "business"
    },
    postedByDetails : {
        executiveName : String,
        officialEmail : String ,
        companyName : String ,
        websiteLink : String ,
    },
    postedOn : {
        type : Date ,
        default : Date.now()
    },
    internshipTitle: {
        type: String,
        require: true,
    },
    location: {
        type: String,
        require: true,
    },
    isRemote : {
      type : Boolean ,
        required : true
    },
    openings: {
        type: Number,
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
    stipend : {
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
        }
    },
    perks : {
        certificate: Boolean,
        letterOfRecommendation: Boolean,
        workHours: Number,
        dressCode: Boolean,
        food: Boolean,
        isPPO: Boolean,
        fiveDaysWeek : Boolean
    },
    skills: [{
        type : String
    }],
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

module.exports = mongoose.model("internshipSchema",Schema);