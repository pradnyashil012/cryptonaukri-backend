const internshipDatabase = require("../models/business/internshipSchema");
const internshipAnswerDatabase = require("../models/user/userAnswersInternship");
const businessDatabase = require("../models/business/businessSchema");
const {sendEmailAfterJobApply} = require("../utils/sendEmailFunctions");
const jobsDatabase = require("../models/business/jobSchema");

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
                message : "Internship has been added and It's now waiting for approval",
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
    const data = await internshipDatabase.find({isDisabled : false , hasBeenApproved : true});
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
                internshipAssociated : req.body.internshipAssociated,
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

            const {firstName , lastName , email } = req.user;
            data.userDetails = {firstName,lastName,email};

            const {internshipTitle , responsibilities } = internshipAssociated;
            data.internshipDetails = {internshipTitle,responsibilities};

            await sendEmailAfterJobApply(internshipAssociated.postedByDetails,req.user,internshipTitle);

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

exports.deleteInternship = async (req,res)=>{
    try{
        const internshipToDelete = await internshipDatabase.findById(req.params.internshipID);
        if(String(req.user._id)===String(internshipToDelete.postedBy)){
            await internshipDatabase.findByIdAndDelete(req.params.internshipID);
            await internshipAnswerDatabase.deleteMany({internshipAssociated : Object(req.params.internshipID)});
            return res.status(203).json({
                code : "INTERNSHIP_DELETED",
                internshipDeletion : true ,
                message : "Internship Successfully Deleted",
                deletedData : internshipToDelete
            });
        }else{
            return res.status(403).json({
                code : "NOT_ELIGIBLE",
                internshipDeletion : false,
                message : "You are not eligible to apply at current job"
            });
        }
    }catch (e) {
        return res.status(500).json({
            code : "INTERNSHIP_DELETION_FAILED",
            internshipDeletion : false,
            message : "Failed to delete current Internship",
        })
    }
}
