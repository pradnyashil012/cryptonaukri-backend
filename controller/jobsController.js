const jobsDatabase = require("../models/business/jobSchema");
const userAnswerDatabase = require("../models/user/userAnswersModel");
const businessDatabase = require("../models/business/businessSchema");
const {sendEmailAfterJobApply} = require("../utils/sendEmailFunctions");

exports.postJob = async (req,res)=>{
    if(req.user.ROLE === "BUSINESS"){
        try{
            const {executiveName , officialEmail , companyName , websiteLink , _id} = req.user;
            req.body.postedBy = _id;
            req.body.postedByDetails = {executiveName,officialEmail,companyName,websiteLink};
            const data = await jobsDatabase.create(req.body);
            return res.status(201).json({
                code : "JOB_ADDED",
                isJobAdded : true ,
                message : "Job has been added and It's now waiting for approval",
                details : data
            });
        }catch (e) {
            console.log(e);
            return res.status(400).json({
                code : "JOB_ADDITION_FAILED",
                isJobAdded : false ,
                message : "An error occurred while adding Job to database"
            });
        }
    }else {
        return res.status(403).json({
            code : "NOT_ELIGIBLE",
            isJobAdded : false,
            message : "You are not eligible to post job"
        });
    }
}

exports.findJobs = async (req,res)=>{
    try{
        const data = await jobsDatabase.find({isDisabled : false,hasBeenApproved : true});
        return res.status(200).json({
            code : "JOBS_FOUND",
            data
        });
    }catch (e) {
        return res.status(500).json({
           code : "ERROR",
           message : "Some Error occurred while finding jobs"
        });
    }
}

exports.findJob = async (req,res)=>{
    try{
        const data = await jobsDatabase.findById(req.params.jobID);
        // console.log(data.postedBy);
        if(data){
            data.postedBy = await businessDatabase.findById(data.postedBy);
            return res.status(200).json({
                code : "JOB_FOUND",
                details : data
            });
        }else{
            return res.status(404).json({
                code : "JOB_NOT_FOUND",
                data
            });
        }
    }catch (e){
        return res.status(400).json({
            code : "WRONG_ID_FORMAT",
            message : "JOB ID format is wrong"
        });
    }
}

exports.applyJob = async (req,res)=>{
    if(req.user.ROLE !== "BUSINESS"){
        try{
            const jobAssociated = await jobsDatabase.findById(req.body.jobAssociated);
            if(jobAssociated.usersApplied.filter(value => String(value.userAssociated) === String(req.user._id)).length > 0){
                return  res.status(400).json({
                    code : "JOB_APPLIED_FAILED",
                    appliedAtJob : false,
                    message : "Failed to apply at current job as you have already applied to it before",
                });
            }
            const data =  {
                userAssociated: req.user._id,
                jobAssociated : req.body.jobAssociated,
                whyHire : req.body.whyHire ,
                candidateAvailability : req.body.candidateAvailability
            }
            const {firstName , lastName , email } = req.user;
            data.userDetails = {firstName,lastName,email};

            const {jobTitle , jobDescription} = jobAssociated;
            data.jobDetails = {jobTitle , jobDescription};

            sendEmailAfterJobApply(jobAssociated.postedByDetails,req.user,jobTitle);

            const savedData = await userAnswerDatabase.create(data);

            jobAssociated.usersApplied.push(savedData);
            const updatedJobAssociated = await jobsDatabase.findByIdAndUpdate(jobAssociated._id , jobAssociated , {new : true});
            return res.status(200).json({
                code : "JOB_APPLIED",
                appliedAtJob : true,
                message : "applied at current job",
                data : updatedJobAssociated
            });
        }catch (e) {
            console.log(e);
            return res.status(500).json({
                code : "JOB_APPLIED_FAILED",
                appliedAtJob : false,
                message : "Failed applied at current job",
            });
        }
    }else{
        return res.status(403).json({
            code : "NOT_ELIGIBLE",
            appliedAtJob : false,
            message : "You are not eligible to apply at current job"
        });
    }
}

exports.deleteJob = async (req,res)=>{
    try{
        const jobToDelete = await jobsDatabase.findById(req.params.jobID);
        if(String(req.user._id)===String(jobToDelete.postedBy)){
            await jobsDatabase.findByIdAndDelete(req.params.jobID);
            await userAnswerDatabase.deleteMany({jobsAssociated : Object(req.params.jobID)});
            return res.status(203).json({
                code : "JOB_DELETED",
                jobDeletion : true ,
                message : "Job Successfully Deleted",
                deletedData : jobToDelete
            });
        }else{
            return res.status(403).json({
                code : "NOT_ELIGIBLE",
                jobDeletion : false,
                message : "You are not eligible to apply at current job"
            });
        }
    }catch (e) {
        return res.status(500).json({
            code : "JOB_DELETION_FAILED",
            jobDeletion : false,
            message : "Failed to delete current job",
        })
    }
}