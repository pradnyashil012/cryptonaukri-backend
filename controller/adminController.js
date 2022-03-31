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
                 deletedOn : Date.now()
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
                deletedOn : Date.now()
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
    if(req.user === "ADMIN"){
        try{
            if(req.query.accountType==="business"){
                const businessToIncreaseValidity = await businessDatabase.findById(req.query.businessID);
                businessToIncreaseValidity.accountDisableDate = Date.now() + 7 * 24 * 60 * 60 * 1000;
                businessToIncreaseValidity.isDisabled = false;
                const updatedBusiness = await businessDatabase.findByIdAndUpdate(req.query.businessID , businessToIncreaseValidity , {new : true});
                await adminLogDatabase.create({
                    extendedBy : req.user._id,
                    extendedDataType : "JOB",
                    extendedData : updatedBusiness ,
                    extendedOn : Date.now()
                });
                return res.status(200).json({
                    message : "Disable Date Updated",
                    code : "DETAIL_UPDATED",
                    detailsUpdated : true ,
                    data : updatedBusiness
                });
            }else if(req.query.accountType==="user"){
                const userToIncreaseValidity = await userDatabase.findById(req.query.userID);
                userToIncreaseValidity.accountDisableDate = Date.now() + 7 * 24 * 60 * 60 * 1000;
                userToIncreaseValidity.isDisabled = false;
                const updatedUser = await businessDatabase.findByIdAndUpdate(req.query.businessID , userToIncreaseValidity , {new : true});
                await adminLogDatabase.create({
                    extendedBy : req.user._id,
                    extendedDataType : "USER",
                    extendedData : updatedUser ,
                    extendedOn : Date.now()
                });
                return res.status(200).json({
                    message : "Disable Date Updated",
                    code : "DETAIL_UPDATED",
                    detailsUpdated : true ,
                    data : updatedUser
                });
            }
        }catch (e) {
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
