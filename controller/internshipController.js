const internshipDatabase = require("../models/business/internshipSchema");
const internshipAnswerDatabase = require("../models/user/userAnswersInternship");
const businessDatabase = require("../models/business/businessSchema");

exports.postInternship = async (req,res)=>{
    if(req.user.ROLE === "BUSINESS"){
        try{
            const {executiveName , officialEmail , companyName , websiteLink , _id} = req.user;
            req.body.postedBy = _id;
            req.body.postedByDetails = {executiveName,officialEmail,companyName,websiteLink};
            const data = await internshipDatabase.create(req.body);
            return res.status(201).json({
                code : "INTERNSHIP_ADDED",
                isInternshipAdded : true ,
                message : "Job has been added to database",
                details : data
            });
        }catch (e) {
            return res.status(400).json({
                code : "INTERNSHIP_ADDITION_FAILED",
                isInternshipAdded : false ,
                message : "An error occurred while adding Job to database"
            });
        }
    }else{
        return res.status(403).json({
            code : "NOT_ELIGIBLE",
            isInternshipAdded : false,
            message : "You are not eligible to post Internship"
        });
    }
}
exports.findInternships = async (req,res)=>{
    const data = await internshipDatabase.find({});
    return res.status(200).json({
        code : "INTERNSHIP_FOUND",
        data
    });
}

exports.findInternship = async (req,res)=>{
    try{
        const data = await internshipDatabase.findById(req.params.internshipID);
        if(data){
            data.postedBy = await businessDatabase.findById(data.postedBy);
            return res.status(200).json({
                code : "INTERNSHIP_FOUND",
                details : data
            });
        }else {
            return res.status(404).json({
                code : "INTERNSHIP_NOT_FOUND",
                data
            });
        }
    }catch (e) {
        return res.status(400).json({
            code : "WRONG_ID_FORMAT",
            message : "INTERNSHIP ID format is wrong"
        });
    }
}

exports.applyInternship = async (req,res)=>{
    if(req.user.ROLE !== "BUSINESS"){
        try{
            const data =  {
                userAssociated: req.user._id,
                internshipAssociated : req.body.jobAssociated,
                whyHire : req.body.whyHire ,
                candidateAvailability : req.body.candidateAvailability
            }
            const internshipAssociated = await internshipDatabase.findById(req.body.internshipAssociated);
            if(internshipAssociated.usersApplied.filter(value => String(value.userAssociated) === String(req.user._id)).length > 0){
                return  res.status(400).json({
                    code : "INTERNSHIP_APPLIED_FAILED",
                    appliedAtInternship : false,
                    message : "Failed to apply at current internship as you have already applied to it before",
                });
            }
            const savedData = await internshipAnswerDatabase.create(data);
            internshipAssociated.usersApplied.push(savedData);
            const updatedInternshipAssociated = await internshipDatabase.findByIdAndUpdate(internshipAssociated._id , internshipAssociated , {new : true});
            return res.status(200).json({
                code : "INTERNSHIP_APPLIED",
                appliedAtInternship : true,
                message : "applied at current internship",
                data : updatedInternshipAssociated
            });
        }catch (e) {
            console.log(e);
            return res.status(400).json({
                code : "INTERNSHIP_APPLIED_FAILED",
                appliedAtInternship : false,
                message : "Failed applied at current internship",
            });
        }
    }else{
        return res.status(403).json({
            code : "NOT_ELIGIBLE",
            appliedAtInternship : false,
            message : "You are not eligible to apply at current internship"
        });
    }
}
