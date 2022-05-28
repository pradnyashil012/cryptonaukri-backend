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

                // TODO : Recheck this part of code

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
            approvedData : jobDataApproved._id ,
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
            html: approveTemplate(jobDataApproved.postedByDetails.executiveName,jobDataApproved.jobTitle)
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
            html: approveTemplate(internshipDataApproved.postedByDetails.executiveName,internshipDataApproved.internshipTitle)
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
        const {firstName , lastName , officialEmail , _id } = req.user;
        req.body.createdBy = {firstName , lastName , officialEmail, _id}
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
const approveTemplate = (executiveName , title)=>{
    return `<html>
  <head>
    <meta charset="UTF-8">
  </head>
  <body>
  <div style="padding: 2.5rem; 
  margin-top: 1.25rem; 
  text-align: center; 
  max-width: 28rem; 
  border-radius: 0.25rem; 
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); 
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin: 0 auto;
  ">
    <img style="margin-top: 2.5rem; width: 50%; margin: 0 auto;" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4ODcuMDggMTk0LjMiPjxkZWZzPjxzdHlsZT4uY2xzLTF7ZmlsbDojMDI0ZWE2O30uY2xzLTJ7ZmlsbDpub25lO308L3N0eWxlPjwvZGVmcz48ZyBpZD0iTGF5ZXJfMiIgZGF0YS1uYW1lPSJMYXllciAyIj48ZyBpZD0iTGF5ZXJfMS0yIiBkYXRhLW5hbWU9IkxheWVyIDEiPjxwb2x5Z29uIGNsYXNzPSJjbHMtMSIgcG9pbnRzPSIxMTIgMzIuMzMgMTEyIDk2Ljk5IDExMS43MyA5Ny4xNSA1NiA2NC45NyAwLjI3IDk3LjE1IDAgOTYuOTkgMCAzMi4zMyAwLjA2IDMyLjMgNTYgMCAxMTIgMzIuMzMiLz48cG9seWdvbiBjbGFzcz0iY2xzLTIiIHBvaW50cz0iMTExLjczIDk3LjE1IDU2IDEyOS4zMyAwLjI3IDk3LjE1IDU2IDY0Ljk3IDExMS43MyA5Ny4xNSIvPjxwb2x5Z29uIGNsYXNzPSJjbHMtMSIgcG9pbnRzPSIxMTIgOTcuMyAxMTIgMTYxLjk3IDU2IDE5NC4zIDAgMTYxLjk3IDAgOTcuMyAwLjA2IDk3LjI3IDAuMjcgOTcuMTUgNTYgMTI5LjMzIDExMS43MyA5Ny4xNSAxMTIgOTcuMyIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTIzMi4zNiw3Ny4zNmEyMy44OSwyMy44OSwwLDAsMC03LjU3LTUuMSwyMy4yNywyMy4yNywwLDAsMC05LjI4LTEuODUsMjQuMywyNC4zLDAsMCwwLTksMS42MiwyMS4wNSwyMS4wNSwwLDAsMC03LjIzLDQuNTksMjEuMzgsMjEuMzgsMCwwLDAtNC43OSw3LDIyLjMzLDIyLjMzLDAsMCwwLTEuNzQsOC45MSwyMC4wOCwyMC4wOCwwLDAsMCwxLjg1LDguNiwyMS4wNywyMS4wNywwLDAsMCw1LDYuODMsMjMuODgsMjMuODgsMCwwLDAsNy4yNiw0LjQ4LDIzLjU2LDIzLjU2LDAsMCwwLDguNjYsMS42MkEyMi4zMiwyMi4zMiwwLDAsMCwyMjYsMTExLjY2YTIzLjY5LDIzLjY5LDAsMCwwLDgtNi41NWw1LjE4LDdhMzEuODUsMzEuODUsMCwwLDEtMTAuNDgsNy42NiwzMi4yNCwzMi4yNCwwLDAsMS0yNS4zMS4zOCwzMC4yNywzMC4yNywwLDAsMS0xNi4zOC0xNi40MiwzMC44OCwzMC44OCwwLDAsMS0yLjQtMTIuMThBMjcuODUsMjcuODUsMCwwLDEsMTg3LDc5LjhhMjkuNjksMjkuNjksMCwwLDEsNi44LTkuNDMsMzIuMDcsMzIuMDcsMCwwLDEsMjEuNzYtOC40NiwzMC42NSwzMC42NSwwLDAsMSwxMi4yNSwyLjQzQTMxLjI4LDMxLjI4LDAsMCwxLDIzNy43Nyw3MVoiLz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik0yNzcuNTMsOTcuMzhIMjcwLjhhMzUuMzcsMzUuMzcsMCwwLDAtNS41NC40MywxNy4xLDE3LjEsMCwwLDAtNS4zOCwxLjgxdjIxLjY0aC04LjQzVjYzLjYxSDI4MS44YTIyLjQxLDIyLjQxLDAsMCwxLDcuMjcsMS4xMkExNi40OCwxNi40OCwwLDAsMSwyOTQuODQsNjhhMTQuODEsMTQuODEsMCwwLDEsMy44LDUuMzNBMTguMywxOC4zLDAsMCwxLDMwMCw4MC42MWExNiwxNiwwLDAsMS0zLjU1LDEwLjc0LDE4LjA4LDE4LjA4LDAsMCwxLTkuODIsNS43Mmw0LjQ4LDkuMmMuOTQsMS4zNCwxLjc0LDIuNDIsMi40MiwzLjI1YTEzLjQ1LDEzLjQ1LDAsMCwwLDIsMiw1LjQ4LDUuNDgsMCwwLDAsMS45NSwxLDksOSwwLDAsMCwyLjQyLjI3bDIuNy0uMDh2OC41OGMtMS42NSwwLTMuMzEtLjA1LTUtLjE1YTE3LjEyLDE3LjEyLDAsMCwxLTQuODQtMSwxMy42MiwxMy42MiwwLDAsMS00LjQxLTIuNywxNi4zNSwxNi4zNSwwLDAsMS0zLjcyLTUuMjZabS0xNy42NS02LjI0YTEzLjg4LDEzLjg4LDAsMCwxLDUuMzMtMS45MSw0My4xMiw0My4xMiwwLDAsMSw1LjU2LS4zNWgxMWExMS40MiwxMS40MiwwLDAsMCw3LjExLTIuMDdjMS44LTEuMzgsMi43MS0zLjYsMi43MS02LjY2YTguMzcsOC4zNywwLDAsMC0uNzgtMy43NSw2Ljc4LDYuNzgsMCwwLDAtMi4wOC0yLjQ5LDguNTgsOC41OCwwLDAsMC0zLjEtMS4zOCwxNi42NywxNi42NywwLDAsMC0zLjg2LS40MkgyNTkuODhaIi8+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMzM0LDg5YTc1LjU0LDc1LjU0LDAsMCwwLDkuNDctMTIuMDYsNjkuOTEsNjkuOTEsMCwwLDAsNi41Ny0xMy4yOWg5LjY2YTEwNy41LDEwNy41LDAsMCwxLTkuNTUsMTcuNywxMjIuMSwxMjIuMSwwLDAsMS0xMS45NCwxNXYyNWgtOC40MnYtMjVhMTIxLjUyLDEyMS41MiwwLDAsMS0xMS45NS0xNSwxMDYuNjQsMTA2LjY0LDAsMCwxLTkuNTQtMTcuN0gzMThhNjkuMTIsNjkuMTIsMCwwLDAsNi41NywxMy4zQTc1LDc1LDAsMCwwLDMzNCw4OVoiLz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik0zNzAuMDksMTIxLjI2VjYzLjYxaDI5LjY1YTIwLjM4LDIwLjM4LDAsMCwxLDYuOTMsMS4xMkExNC42MiwxNC42MiwwLDAsMSw0MTIsNjhhMTQuNDUsMTQuNDUsMCwwLDEsMy40LDUuMTgsMjAuNTUsMjAuNTUsMCwwLDEsMCwxMy44NEExNS4xMiwxNS4xMiwwLDAsMSw0MTIsOTIuMjRhMTQuNDUsMTQuNDUsMCwwLDEtNS4zNCwzLjM2LDE5LjcxLDE5LjcxLDAsMCwxLTYuOTMsMS4xNkgzODkuNTFhMzMuNTksMzMuNTksMCwwLDAtNS41Ny40NywxNy44NCwxNy44NCwwLDAsMC01LjQyLDEuODV2MjIuMThabTI5LjYxLTMzcTguNDksMCw4LjUtOC4xNSwwLTQuMzktMi4xNy02LjE5dC02LjMzLTEuODFIMzc4LjUyVjkwLjU4YTE0LjU2LDE0LjU2LDAsMCwxLDUuMzctMS45Myw0MC40NCw0MC40NCwwLDAsMSw1LjYtLjM5WiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTQ1MS40OCw3Mi4xMXY0OS4xNWgtOC4xOVY3Mi4xMUg0MjIuNzN2LTguNWg0OS4wOHY4LjVaIi8+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNNTQwLjksOTIuNTFhMjguMjUsMjguMjUsMCwwLDEtMi41MSwxMS45MSwzMC4zOSwzMC4zOSwwLDAsMS02Ljc3LDkuNSwzMiwzMiwwLDAsMS0zNC4wNSw2LjI2LDMwLjc0LDMwLjc0LDAsMCwxLTE4LjgxLTI4LjYsMjgsMjgsMCwwLDEsMi41MS0xMS43OCwyOS43NSwyOS43NSwwLDAsMSw2LjgyLTkuNDMsMzIuMTEsMzIuMTEsMCwwLDEsMjEuNzgtOC40NywzMS4yNSwzMS4yNSwwLDAsMSwyMS45NCw4Ljg1LDMwLjc4LDMwLjc4LDAsMCwxLDYuNjUsOS43QTI5LjYzLDI5LjYzLDAsMCwxLDU0MC45LDkyLjUxWm0tOC40Mi0uNWEyMC42MiwyMC42MiwwLDAsMC0xLjgyLTguNjgsMjEuMjksMjEuMjksMCwwLDAtNC45NC02Ljg3QTIyLjU2LDIyLjU2LDAsMCwwLDUxOC40OSw3MmEyMy45NCwyMy45NCwwLDAsMC04Ljc0LTEuNTgsMjQuMywyNC4zLDAsMCwwLTksMS42MiwyMS4wNSwyMS4wNSwwLDAsMC03LjIzLDQuNTksMjEuMzgsMjEuMzgsMCwwLDAtNC43OSw3QTIyLjUsMjIuNSwwLDAsMCw0ODcsOTIuNTVhMjAuMDksMjAuMDksMCwwLDAsMS44Niw4LjYsMjAuOSwyMC45LDAsMCwwLDUsNi44MywyMy44MSwyMy44MSwwLDAsMCw3LjI3LDQuNDgsMjMuNDYsMjMuNDYsMCwwLDAsOC42NSwxLjYyLDIyLjksMjIuOSwwLDAsMCw4Ljc3LTEuNywyMi4yNCwyMi4yNCwwLDAsMCw3LjE5LTQuNjcsMjIuNzUsMjIuNzUsMCwwLDAsNC44Ny03QTIwLjgsMjAuOCwwLDAsMCw1MzIuNDgsOTJaIi8+PHBhdGggZD0iTTU0Ny40Nyw2My42MWgxMC45bDM3LDQ0LjA1di00NGg4LjQzdjU3LjY1aC04LjM0bC0zMy0zOS42NXYzOS42NUg1NTQuMlY3MS43MloiLz48cGF0aCBkPSJNNjM1Ljc0LDYyLjZINjQ1bDI3Ljc1LDU4LjY2aC05LjQzbC0zLjc5LTguNDJINjQyYTQxLDQxLDAsMCwwLTcsLjU0LDI3LjYyLDI3LjYyLDAsMCwwLTUuMjEsMS4zOSwxNC4zOSwxNC4zOSwwLDAsMC0zLjQ4LDEuODYsNS44Nyw1Ljg3LDAsMCwwLTEuNzgsMS45M2wtMS40NywyLjdoLTkuMTJsMjUtNTEuNTVabTIwLDQxLjc0TDY0My4xNiw4MCw2MzAuNCwxMDcuNThhMTMuNzMsMTMuNzMsMCwwLDEsNS4xLTIuMjgsMzguMjQsMzguMjQsMCwwLDEsOS41OS0xWiIvPjxwYXRoIGQ9Ik03MDgsMTIyLjU4cS0xMi4zNywwLTE5LjE2LTYuMTh0LTYuNzctMTcuNTVWNjMuNjFoOC40M1Y5OC44cTAsNy40OSw0LjU1LDExLjM4dDEyLjk1LDMuOXE4LjQxLDAsMTMtMy45dDQuNTUtMTEuMzhWNjMuNjFINzM0Vjk4Ljg1cTAsMTEuMzYtNi43NywxNy41NVQ3MDgsMTIyLjU4WiIvPjxwYXRoIGQ9Ik03NTguNTUsMTIxLjI2aC04LjQyVjYzLjYxaDguNDJ2NDMuMDVsMjkuMjktNDNINzk4TDc3OSw5MC43M2wxMC4zNiwxNS41NGExNy42MSwxNy42MSwwLDAsMCw0LjkxLDUuMzMsNi44Miw2LjgyLDAsMCwwLDQuMDYsMS4xNmwyLjM5LS4wN3Y4LjU3aC0zYTI4Ljg1LDI4Ljg1LDAsMCwxLTMuODMtLjIzLDEwLjgsMTAuOCwwLDAsMS0zLjU5LTEuMTIsMTQuNiwxNC42LDAsMCwxLTMuNjMtMi43LDI2LjQ4LDI2LjQ4LDAsMCwxLTMuODctNS4wN2wtOC43My0xNFoiLz48cGF0aCBkPSJNODQwLDk3LjM4aC02Ljc0YTM1LjM0LDM1LjM0LDAsMCwwLTUuNTMuNDMsMTYuOTMsMTYuOTMsMCwwLDAtNS4zOCwxLjgxdjIxLjY0aC04LjQzVjYzLjYxaDMwLjM1YTIyLjQ1LDIyLjQ1LDAsMCwxLDcuMjcsMS4xMkExNi40OCwxNi40OCwwLDAsMSw4NTcuMjgsNjhhMTQuNzgsMTQuNzgsMCwwLDEsMy43OSw1LjMzLDE4LjQ5LDE4LjQ5LDAsMCwxLDEuMzYsNy4yNywxNiwxNiwwLDAsMS0zLjU1LDEwLjc0LDE4LjEyLDE4LjEyLDAsMCwxLTkuODIsNS43Mmw0LjQ4LDkuMmMuOTQsMS4zNCwxLjc0LDIuNDIsMi40MiwzLjI1YTEzLDEzLDAsMCwwLDEuOTUsMiw1LjQsNS40LDAsMCwwLDIsMSw4LjkyLDguOTIsMCwwLDAsMi40MS4yN2wyLjcxLS4wOHY4LjU4Yy0xLjY1LDAtMy4zMS0uMDUtNS0uMTVhMTcsMTcsMCwwLDEtNC44NC0xLDEzLjc3LDEzLjc3LDAsMCwxLTQuNDItMi43LDE2LjQ4LDE2LjQ4LDAsMCwxLTMuNzEtNS4yNlptLTE3LjY1LTYuMjRhMTMuODgsMTMuODgsMCwwLDEsNS4zMy0xLjkxLDQzLDQzLDAsMCwxLDUuNTYtLjM1aDExYTExLjQzLDExLjQzLDAsMCwwLDcuMTEtMi4wN3EyLjctMi4wNywyLjctNi42NmE4LjIzLDguMjMsMCwwLDAtLjc3LTMuNzUsNi43MSw2LjcxLDAsMCwwLTIuMDktMi40OSw4LjQ2LDguNDYsMCwwLDAtMy4wOS0xLjM4LDE2LjY3LDE2LjY3LDAsMCwwLTMuODYtLjQySDgyMi4zMloiLz48cGF0aCBkPSJNODc4LjgxLDEyMS4yNlY2My42MWg4LjI3djU3LjY1WiIvPjwvZz48L2c+PC9zdmc+" />
    <h1 style="margin-top: 1rem; color: #4B5563; font-size: 1.25rem;line-height: 1.75rem; font-weight: 600; ">Application Update</h1><br/>
               
    <p style="margin-top: 0.5rem; color: #374151; ">Hey There , ${executiveName}</p>
    </p>
    
    <p style="margin-top: 0.5rem; color: #374151; ">The Job(${title}) which you posted has been approved</p>
    </p>


    <span style="color: #9CA3AF; 
  font-size: 0.75rem;
  line-height: 1rem; ">if you did not expect this message, simply ignore this.</span>
    <p class="mt-6 text-xs text-left">
      Sent by <a style="color: #2563EB; 
  text-decoration: underline; " href="https://www.cryptonaukri.com/">CryptoNaukri</a>
    </p>
  <div style="display: flex; 
  margin-top: 0.75rem; 
  display: flex; 
  justify-content: flex-start; 
  gap: 0.5rem; ">
      <a href="https://www.instagram.com/cryptonaukri/">
        <img style="width: 1.25rem; "src="data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+RmFjZWJvb2s8L3RpdGxlPjxwYXRoIGQ9Ik0yNCAxMi4wNzNjMC02LjYyNy01LjM3My0xMi0xMi0xMnMtMTIgNS4zNzMtMTIgMTJjMCA1Ljk5IDQuMzg4IDEwLjk1NCAxMC4xMjUgMTEuODU0di04LjM4NUg3LjA3OHYtMy40N2gzLjA0N1Y5LjQzYzAtMy4wMDcgMS43OTItNC42NjkgNC41MzMtNC42NjkgMS4zMTIgMCAyLjY4Ni4yMzUgMi42ODYuMjM1djIuOTUzSDE1LjgzYy0xLjQ5MSAwLTEuOTU2LjkyNS0xLjk1NiAxLjg3NHYyLjI1aDMuMzI4bC0uNTMyIDMuNDdoLTIuNzk2djguMzg1QzE5LjYxMiAyMy4wMjcgMjQgMTguMDYyIDI0IDEyLjA3M3oiLz48L3N2Zz4=" />
      </a>
      <a href="">
        <img style="width: 1.25rem;" src="data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+R21haWw8L3RpdGxlPjxwYXRoIGQ9Ik0yNCA1LjQ1N3YxMy45MDljMCAuOTA0LS43MzIgMS42MzYtMS42MzYgMS42MzZoLTMuODE5VjExLjczTDEyIDE2LjY0bC02LjU0NS00LjkxdjkuMjczSDEuNjM2QTEuNjM2IDEuNjM2IDAgMCAxIDAgMTkuMzY2VjUuNDU3YzAtMi4wMjMgMi4zMDktMy4xNzggMy45MjctMS45NjRMNS40NTUgNC42NCAxMiA5LjU0OGw2LjU0NS00LjkxIDEuNTI4LTEuMTQ1QzIxLjY5IDIuMjggMjQgMy40MzQgMjQgNS40NTd6Ii8+PC9zdmc+" />
      </a>
      <a href="https://www.linkedin.com/company/cryptonaukri/">
        <img style="width: 1.25rem; "src="data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+TGlua2VkSW48L3RpdGxlPjxwYXRoIGQ9Ik0yMC40NDcgMjAuNDUyaC0zLjU1NHYtNS41NjljMC0xLjMyOC0uMDI3LTMuMDM3LTEuODUyLTMuMDM3LTEuODUzIDAtMi4xMzYgMS40NDUtMi4xMzYgMi45Mzl2NS42NjdIOS4zNTFWOWgzLjQxNHYxLjU2MWguMDQ2Yy40NzctLjkgMS42MzctMS44NSAzLjM3LTEuODUgMy42MDEgMCA0LjI2NyAyLjM3IDQuMjY3IDUuNDU1djYuMjg2ek01LjMzNyA3LjQzM2MtMS4xNDQgMC0yLjA2My0uOTI2LTIuMDYzLTIuMDY1IDAtMS4xMzguOTItMi4wNjMgMi4wNjMtMi4wNjMgMS4xNCAwIDIuMDY0LjkyNSAyLjA2NCAyLjA2MyAwIDEuMTM5LS45MjUgMi4wNjUtMi4wNjQgMi4wNjV6bTEuNzgyIDEzLjAxOUgzLjU1NVY5aDMuNTY0djExLjQ1MnpNMjIuMjI1IDBIMS43NzFDLjc5MiAwIDAgLjc3NCAwIDEuNzI5djIwLjU0MkMwIDIzLjIyNy43OTIgMjQgMS43NzEgMjRoMjAuNDUxQzIzLjIgMjQgMjQgMjMuMjI3IDI0IDIyLjI3MVYxLjcyOUMyNCAuNzc0IDIzLjIgMCAyMi4yMjIgMGguMDAzeiIvPjwvc3ZnPg==" />
      </a>
      <a href="">
    </div>
  </div>
  </body>
</html>`;
}