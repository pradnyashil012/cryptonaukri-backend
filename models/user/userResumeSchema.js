const mongoose = require("mongoose");

const options = {_id : false};

const educationSubSchema = new mongoose.Schema({
    institutionName : String,
    startingDate :String,
    endingDate:String,
    coursePursued:String,
    marksScored:String
},options);
const jobsSubSchema = new mongoose.Schema({
    companyName : String ,
    startingDate  : String ,
    endingDate : String ,
    description : String,
    role : String
},options);
const internshipSubSchema = new mongoose.Schema({
    companyName : String ,
    startingDate  : String ,
    endingDate : String ,
    description : String,
    role : String
},options);
const coursesSubSchema = new mongoose.Schema({
    name : String ,
    startingDate : String,
    endingDate : String ,
    description : String
},options)

const projectSubSchema = new mongoose.Schema({
    name : String ,
    startingDate : String,
    endingDate : String ,
    description : String ,
    projectLink : String
},options)

const schema = new mongoose.Schema({
    userAssociated: {
        type: mongoose.Schema.Types.ObjectId,
        ref : "user",
        unique : true
    },
    education: [educationSubSchema],
    jobs : [jobsSubSchema],
    internships : [internshipSubSchema],
    courses: [coursesSubSchema],
    projects: [projectSubSchema],
    skills: [{
        type: String
    }]
});

module.exports = mongoose.model("userResume",schema);