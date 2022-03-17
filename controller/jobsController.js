const jobsDatabase = require("../models/business/jobSchema");
const userAnswerDatabase = require("../models/user/userAnswersModel");

exports.postJob = async (req,res)=>{
    try{
        req.body.postedBy = req.user._id;
        const data = await jobsDatabase.create(req.body);
        return res.status(201).json({
            code : "JOB_ADDED",
            isJobAdded : true ,
            message : "Job has been added to database",
            details : data
        });
    }catch (e) {
        return res.status(400).json({
            code : "JOB_ADDITION_FAILED",
            isJobAdded : false ,
            message : "An error occurred while adding Job to database"
        });
    }
}
exports.findJobs = async (req,res)=>{
    const data = await jobsDatabase.find({});
    return res.status(200).json({
        code : "JOBS_FOUND",
        data
    });
}

exports.applyJob = async (req,res)=>{
    if(req.user.ROLE !== "BUSINESS"){
        try{
            const data =  {
                userAssociated: req.user._id,
                jobAssociated : req.body.jobAssociated,
                whyHire : req.body.whyHire ,
                candidateAvailability : req.body.candidateAvailability
            }
            const jobAssociated = await jobsDatabase.findById(req.body.jobAssociated);
            // Still not sure why this is not working.......!!
            if(jobAssociated.usersApplied.filter(value => value.userAssociated === req.user._id).length > 0){
                return  res.status(400).json({
                    code : "JOB_APPLIED_FAILED",
                    appliedAtJob : false,
                    message : "Failed to apply at current job as you have already applied to it before",
                });
            }
            const savedData = await userAnswerDatabase.create(data);
            jobAssociated.usersApplied.push(savedData);
            const updatedJobAssociated = await jobsDatabase.findByIdAndUpdate(jobAssociated._id , jobAssociated , {new : true});
            return res.status(200).json({
                code : "JOB_APPLIED",
                appliedAtJob : true,
                message : "applied at current job",
                data : updatedJobAssociated
            })
        }catch (e) {
            console.log(e);
            return res.status(400).json({
                code : "JOB_APPLIED_FAILED",
                appliedAtJob : false,
                message : "Failed applied at current job",
            });
        }
    }else{
        return res.status(400).json({
            code : "NOT_ELIGIBLE",
            appliedAtJob : false,
            message : "You are not eligible to apply at current job"
        });
    }
}