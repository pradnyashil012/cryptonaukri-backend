const internshipDatabase = require("../models/business/internshipSchema");

exports.postInternship = async (req,res)=>{
    if(req.user.ROLE === "BUSINESS"){
        try{
            const {executiveName , officialEmail , companyName , websiteLink , _id} = req.user;
            req.body.postedBy = _id;
            req.body.postedByDetails = {executiveName,officialEmail,companyName,websiteLink};
            const data = await internshipDatabase.create(req.body);
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
    }else{
        return res.status(403).json({
            code : "NOT_ELIGIBLE",
            appliedAtJob : false,
            message : "You are not eligible to post Internship"
        });
    }
}