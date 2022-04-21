const adminDatabase = require("../models/admin/adminSchema");
const adminKeyDatabase = require("../models/admin/adminKey");
const userDatabase = require("../models/user/userSchema");
const businessDatabase = require("../models/business/businessSchema");
const jobDatabase = require("../models/business/jobSchema");
const internshipDatabase = require("../models/business/internshipSchema");
const userAnswersJobDatabase = require("../models/user/userAnswersModel");
const userAnswersInternshipDatabase = require("../models/user/userAnswersInternship");
const adminLogDatabase = require("../models/admin/adminLogs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const keyGeneration = require("../utils/adminKeyGeneration");
const jobsDatabase = require("../models/business/jobSchema");
const jobAnswersDatabase = require("../models/user/userAnswersModel");
const internshipAnswersDatabase = require("../models/user/userAnswersInternship");
const nodemailer = require("nodemailer");
const customCouponDatabase = require("../models/customCoupon");

exports.ownerAdminKeyGeneration = async (req,res)=>{
    if(req.body.username === process.env.OWNER_USERNAME && req.body.password === process.env.OWNER_PASSWORD){
        const key = await keyGeneration();
        return res.status(201).json({
            key ,
            message : "Admin Key generated"
        });
    }else{
        return res.status(403).json({
            message : "Sorry You are not authorized to access this endpoint"
        });
    }
}

exports.adminSignup = async (req,res)=>{
    try{
        if(req.user.ROLE === "USER"){
            if(req.query.key){
                const key = await adminKeyDatabase.findOne({key : req.query.key});
                if(!key.userAssociated){
                    const {firstName , lastName , password , location , email , phoneNumber} = req.user;
                    const adminData = {firstName , lastName , password , location , phoneNumber ,
                        officialEmail : email};
                    await adminDatabase.create(adminData);
                    key.userAssociated = email;
                    await adminKeyDatabase.findByIdAndUpdate(key._id , key);
                    return res.status(201).json({
                        isAdminRegistered : true ,
                        CODE : "ADMIN_ADDED",
                        message : "Admin has been added",
                        adminData
                    });
                }else{
                    return res.status(400).json({
                        isAdminRegistered : false ,
                        CODE : "BAD_KEY",
                        message : "Admin key given to the user is being used by someone else",
                    });
                }
            }else{
                return res.status(400).json({
                    isAdminRegistered : false ,
                    CODE : "KEY_NOT_PRESENT",
                    message : "Admin key is not present",
                });
            }
        }else{
            return res.status(403).json({
                isAdminRegistered : false ,
                CODE : "NOT_ELIGIBLE",
                message : "You are not eligible to become an Admin",
            });
        }
    }catch (e) {
        return res.status(400).json({
            isAdminRegistered : false ,
            CODE : "ERROR_OCCURRED",
            message : "Some error occurred while adding an admin",
        });
    }
}

exports.adminLogin = async (req,res)=>{
    const admin = await adminDatabase.findOne({officialEmail : req.body.email});
    if(!admin){
        return res.status(404).json({
            userLoggedIn : false ,
            code : "NOT_FOUND" ,
            message : "admin with such email does not exist"
        });
    }
    const validatePassword = await bcrypt.compare(req.body.password , admin.password);
    if(!validatePassword){
        return res.status(400).json({
            adminLoggedIn : false ,
            code : "WRONG_PASSWORD",
            message : "admin entered password was wrong"
        });
    }
    const token = await jwt.sign({
        adminID : admin._id,
        ROLE : "ADMIN"
    },process.env.JWT_KEY, {
        expiresIn : "48h"
    });
    return res.status(200).header({
        "Authorization" : token
    }).json({
        adminLoggedIn : true ,
        code : "LOGGED_IN" ,
        message : "Admin Logged In Successfully"
    });
}

exports.deleteJob = async (req,res)=>{
    try{
         if(req.user.ROLE === "ADMIN"){
             const deletedJob = await jobDatabase.findByIdAndDelete(req.params.jobID);
             await userAnswersJobDatabase.deleteMany({jobAssociated : req.params.jobID});
             const data = {
                 deletedBy : req.user._id,
                 deletedDataType : "JOB",
                 deletedData : deletedJob,
                 deletedOn : new Date(Date.now())
             }
             await adminLogDatabase.create(data);
             return res.status(204).json({
                 deletedJob : true ,
                 message : "Job was deleted",
                 data
             });
         }else{
             return res.status(403).json({
                 code : "NOT_ELIGIBLE",
                 appliedAtJob : false,
                 message : "You are not eligible to delete the job"
             });
         }
    }catch (e) {
        return res.status(400).json({
            deletedJob : false ,
            message : "Job wasn't deleted"
        });
    }
}

exports.deleteInternship = async (req,res)=>{
    try{
        if(req.user.ROLE === "ADMIN"){
            const deletedInternship = await internshipDatabase.findByIdAndDelete(req.params.internshipID);
            await userAnswersInternshipDatabase.deleteMany({jobAssociated : req.params.internshipID});
            const data = {
                deletedBy : req.user._id,
                deletedDataType : "INTERNSHIP",
                deletedData : deletedInternship,
                deletedOn : new Date(Date.now())
            }
            await adminLogDatabase.create(data);
            return res.status(204).json({
                deletedJob : true ,
                message : "Job was deleted",
                data
            });
        }else{
            return res.status(403).json({
                code : "NOT_ELIGIBLE",
                appliedAtJob : false,
                message : "You are not eligible to delete the job"
            });
        }
    }catch (e) {
        return res.status(400).json({
            deletedJob : false ,
            message : "Internship wasn't deleted"
        });
    }
}
exports.increaseValidity = async (req,res)=>{
    if(req.user.ROLE === "ADMIN"){
        try{
            if(req.query.accountType==="business"){
                const businessToIncreaseValidity = await businessDatabase.findOne({officialEmail : req.query.email});
                businessToIncreaseValidity.accountDisableDate = Date.now() + 7 * 24 * 60 * 60 * 1000;

                if(businessToIncreaseValidity.isDisabled){
                    const jobs = await jobsDatabase.find({postedBy : businessToIncreaseValidity._id});
                    await asyncForEach(jobs , async (val)=>{
                        val.isDisabled = false;
                        const userAnswers = await jobAnswersDatabase.find({jobAssociated : val._id});
                        userAnswers.forEach(data =>{
                            data.isDisabled = false;
                        });
                        await jobAnswersDatabase.updateMany({jobAssociated : val._id},userAnswers);
                    });
                    await jobsDatabase.updateMany({postedBy : businessToIncreaseValidity._id},jobs);
                    const internships = await internshipDatabase.find({postedBy : businessToIncreaseValidity._id});
                    await asyncForEach(internships , async (val)=>{
                        val.isDisabled = false;
                        const userAnswers = await internshipAnswersDatabase.find({jobAssociated : val._id});
                        userAnswers.forEach(data =>{
                            data.isDisabled = false;
                        });
                        await internshipAnswersDatabase.updateMany({jobAssociated : val._id},userAnswers);
                    });
                    await internshipDatabase.updateMany({postedBy : businessToIncreaseValidity._id} , internships);
                }

                businessToIncreaseValidity.isDisabled = false;
                const updatedBusiness = await businessDatabase.findByIdAndUpdate(businessToIncreaseValidity._id , businessToIncreaseValidity , {new : true});

                await adminLogDatabase.create({
                    extendedBy : req.user._id,
                    extendedDataType : "JOB",
                    extendedData : updatedBusiness ,
                    extendedOn : new Date(Date.now())
                });

                return res.status(200).json({
                    message : "Disable Date Updated",
                    code : "DETAIL_UPDATED",
                    detailsUpdated : true ,
                    data : updatedBusiness
                });
            }else if(req.query.accountType==="user"){
                const userToIncreaseValidity = await userDatabase.findOne({email : req.query.email});
                userToIncreaseValidity.accountDisableDate = Date.now() + 7*24*60*60*1000;
                userToIncreaseValidity.isDisabled = false;
                const updatedUser = await userDatabase.findByIdAndUpdate(userToIncreaseValidity._id , userToIncreaseValidity , {new : true});
                await adminLogDatabase.create({
                    extendedBy : req.user._id,
                    extendedDataType : "USER",
                    extendedData : updatedUser ,
                    extendedOn : new Date(Date.now())
                });
                return res.status(200).json({
                    message : "Disable Date Updated",
                    code : "DETAIL_UPDATED",
                    detailsUpdated : true ,
                    data : updatedUser
                });
            }
        }catch (e) {
            console.log(e);
            return res.status(400).json({
                message : "some error occurred while updating the data ",
                code : "UPDATE_FAILED",
                detailsUpdated : false
            });
        }
    }else{
        return res.status(403).json({
            code : "NOT_ELIGIBLE",
            detailsUpdated : false,
            message : "You are not eligible to perform this task"
        });
    }
}

exports.adminDashBoardData = async (req,res)=>{
    if(req.user.ROLE === "ADMIN"){
        try{
            const jobsData = await jobDatabase.find({hasBeenApproved : true});
            const jobsToApprove = await jobsDatabase.find({hasBeenApproved : false });
            const internshipData =  await internshipDatabase.find({hasBeenApproved : true});
            const internshipsToApprove = await internshipDatabase.find({hasBeenApproved : false});
            const users = await userDatabase.find({});
            const businesses = await businessDatabase.find({});
            return res.status(200).json({
                code : "DATA",
                data : {
                    jobsData , internshipData , users ,businesses , jobsToApprove , internshipsToApprove
                }
            });
        }catch (e) {
            return res.status(400).json({
                message : "There was some error while fetching the data"
            });
        }
    }else{
        return res.status(403).json({
            code : "NOT_ELIGIBLE",
            message : "You are not eligible to perform this task"
        });
    }
}

exports.fetchAdminLogs = async (req,res)=>{
    if(req.body.username === process.env.OWNER_USERNAME && req.body.password === process.env.OWNER_PASSWORD){
        const adminData = await adminLogDatabase.find({});
        return res.status(201).json({
            adminData
        });
    }else{
        return res.status(403).json({
            message : "Sorry You are not authorized to access this endpoint"
        });
    }
}

exports.jobApprovalPart = async (req,res)=>{
    try{
        const jobDataApproved = await jobDatabase.findByIdAndUpdate(req.params.jobID ,
            {hasBeenApproved : true} , {new : true});
        await adminLogDatabase.create({
            approvedBy : req.user._id,
            extendedData : jobDataApproved._id ,
            extendedOn : new Date(Date.now())
        });

        const transporter = nodemailer.createTransport({
            service : "smtp",
            host : process.env.EMAIL_HOST,
            name :process.env.EMAIL_NAME,
            port : process.env.EMAIL_PORT,
            secure : true ,
            auth : {
                user : process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });
        const mailOptions = {
            from: process.env.EMAIL,
            to: jobDataApproved.postedByDetails.officialEmail,
            subject: 'Job Approved',
            html: `
               <h4>Hey There , ${jobDataApproved.postedByDetails.executiveName}</h4>
               <h4>The Job(${jobDataApproved.jobTitle}) which you posted has been approved</h4>
            `
        }
        transporter.sendMail(mailOptions,(err,data)=>{
            if(err)
                console.log(err);
        });
        return res.status(200).json({
           code : "JOB approved",
           message : "Job has been approved",
           data : jobDataApproved
        });

    }catch (e) {
        return res.status(400).json({
            message : "There was some error while fetching the data"
        });
    }
}


exports.internshipApprovalPart = async (req,res)=>{
    try{
        const internshipDataApproved = await internshipDatabase.findByIdAndUpdate(req.params.internshipID ,
            {hasBeenApproved : true} , {new : true});
        await adminLogDatabase.create({
            approvedBy : req.user._id,
            extendedData : internshipDataApproved._id ,
            extendedOn : new Date(Date.now())
        });

        const transporter = nodemailer.createTransport({
            service : "smtp",
            host : process.env.EMAIL_HOST,
            name :process.env.EMAIL_NAME,
            port : process.env.EMAIL_PORT,
            secure : true ,
            auth : {
                user : process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });
        const mailOptions = {
            from: process.env.EMAIL,
            to: internshipDataApproved.postedByDetails.officialEmail,
            subject: 'Internship Approved',
            html: `
               <h4>Hey There , ${internshipDataApproved.postedByDetails.executiveName}</h4>
               <h4>The Job(${internshipDataApproved.internshipTitle}) which you posted has been approved</h4>
            `
        }
        transporter.sendMail(mailOptions,(err,data)=>{
            if(err)
                console.log(err);
        });
        return res.status(200).json({
            code : "Internship approved",
            message : "Internship has been approved",
            data : internshipDataApproved
        });

    }catch (e) {
        console.log(e);
        return res.status(400).json({
            message : "There was some error while fetching the data"
        });
    }
}
/*

 */
exports.generateCustomCoupon = async (req,res)=>{
    try{
        req.body.finalCoupon = req.body.couponName + req.body.numberOfDays;
        const couponData = await customCouponDatabase.create(req.body);
        await adminLogDatabase.create({
            addedBy : req.user._id,
            couponAdded : couponData._id,
            addedOn : new Date(Date.now())
        });
        return res.status(201).json({
            data : couponData,
            finalCoupon : req.body.finalCoupon,
            message : "Your Custom Coupon has been added to database",
            code : "CUSTOM_COUPON_ADDED"
        });
    }catch (e) {
        return res.status(400).json({
            message : "Your Custom Coupon has not been added to database",
            code : "CUSTOM_COUPON_NOT_ADDED"
        });
    }
}


async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}
