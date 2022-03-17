const businessDatabase = require("../models/business/businessSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Redis = require("ioredis");
const redisClient = new Redis(process.env.REDIS);
const jobsDatabase = require("../models/business/jobSchema");


exports.sendOTP = async (req,res)=>{
    const businessPresenceCheck = await businessDatabase.findOne({email : req.query.email});
    if(!businessPresenceCheck){
        const transporter = nodemailer.createTransport({
            service:"gmail",
            auth : {
                user : process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });
        let otp = 0;
        await redisClient.get(`BUSINESS_${req.query.email}`)
            .then(async (data)=>{
                if(data){
                    otp = Number(data);
                }else{
                    otp = Math.floor(1000 + Math.random() * 9000);
                    await redisClient.set(`BUSINESS_${req.query.email}`,otp , "EX" , 600);
                }
            })
            .catch(async (error)=>{
                console.log(error);
                return res.status(400).json({
                    code : "OTP_FAILED",
                    otpSent : false,
                    message : "Failed To set OTP"
                });
            });
        const mailOptions = {
            from: process.env.EMAIL,
            to: req.query.email,
            subject: 'Business Email verification for Cryptonaukri.com',
            html: `
               <h2>Thanks for Choosing Cryptonaukri.com </h2>
               <h4> Please verify your mail to continue...</h4>
               <h4>You Have 10 mins to validate this OTP</h4>
               <h4>${otp}</h4>
            `
        }
        transporter.sendMail(mailOptions,(err,data)=>{
            if(err){
                return res.status(400).json({
                    code : "OTP_FAILED",
                    otpSent : false,
                    message : "Failed To send OTP"
                });
            }else{
                return res.status(200).json({
                    code : "OTP_SENT",
                    otpSent : true,
                    message : "OTP sent"
                });
            }
        });
    }else{
        return res.status(400).json({
            code : "DUPLICATE",
            userAdded : false,
            message : "Email ID already exists"
        });
    }
}


exports.businessSignup = async (req,res)=>{
    redisClient.get(`BUSINESS_${req.body.officialEmail}`)
        .then( async (data)=> {
            if( Number(data) === req.body.otp){
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(req.body.password , salt);
                const businessDataToBeSaved = {
                    executiveName : req.body.executiveName,
                    officialEmail : req.body.officialEmail,
                    password : hashedPassword,
                    companyName : req.body.companyName,
                    description : req.body.description,
                    establishedYear : req.body.establishedYear,
                    GSTIN : req.body.GSTIN,
                    headquarters : req.body.headquarters,
                    phoneNumber : req.body.phoneNumber,
                    websiteLink : req.body.websiteLink
                };
                try{
                    await businessDatabase.create(businessDataToBeSaved);
                    return res.status(201).json({
                        code : "BUSINESS_ADDED",
                        userAdded : true,
                        message : "Business has been added successfully"
                    });
                }catch (error) {
                    // Need to make this error more specific.
                    return res.status(400).json({
                        code : "DUPLICATE",
                        userAdded : false,
                        message : "Email ID already exists"
                    });
                }
            }else{
                return res.status(400).json({
                    code : "WRONG_OTP",
                    userAdded : false,
                    message : "Wrong OTP"
                });
            }
        })
        .catch(error =>{
            console.log(error);
            return res.status(400).json({
                code : "OTP_RETRIEVAL",
                userAdded : false,
                message : "some error occurred while retrieving the OTP"
            });
        });
}

exports.businessLogin = async (req,res)=>{
    const business = await businessDatabase.findOne({email : req.body.email});
    if(!business){
        return res.status(404).json({
            userLoggedIn : false ,
            code : "NOT_FOUND" ,
            message : "Business with such email does not exist"
        });
    }
    const validatePassword = await bcrypt.compare(req.body.password , business.password);
    if(!validatePassword){
        return res.status(400).json({
            userLoggedIn : false ,
            code : "WRONG_PASSWORD",
            message : "business's entered password was wrong"
        });
    }
    const token = await jwt.sign({
        businessID : business._id,
    },process.env.JWT_KEY, {
        expiresIn : "48h"
    });
    return res.status(200).header({
        "Authorization" : token
    }).json({
        userLoggedIn : true ,
        code : "LOGGED_IN" ,
        message : "Business Logged In Successfully"
    });
}

exports.changePassword = async (req,res)=>{
    const previousPassword = await bcrypt.compare(req.body.previousPassword , req.user.password);
    if(!previousPassword){
        return res.status(400).json({
            changedPassword : false ,
            code : "WRONG_PASSWORD",
            message  : "entered previous password is wrong"
        });
    }
    const salt = await bcrypt.genSalt(10);
    req.user.password = await bcrypt.hash(req.body.newPassword , salt);

    try {
        await businessDatabase.findByIdAndUpdate(req.user._id , req.user);
        return res.status(200).json({
            changedPassword : true ,
            code : "CHANGED_PASSWORD",
            message  : "changed the current password"
        });
    }catch (e) {
        return res.status(200).json({
            changedPassword : false ,
            code : "ERROR",
            message  : "An error occurred while updating the password"
        });
    }
}

exports.forgetPasswordOTP = async (req,res)=>{
    const business = await businessDatabase.findOne({email : req.query.email});
    if(business){
        const transporter = nodemailer.createTransport({
            service:"gmail",
            auth : {
                user : process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });
        let otp = 0;
        await redisClient.get(`BUSINESS_${req.query.email}`)
            .then(async (data)=>{
                if(data){
                    otp = Number(data);
                }else{
                    otp = Math.floor(1000 + Math.random() * 9000);
                    await redisClient.set(`BUSINESS_${req.query.email}`,otp , "EX" , 600);
                }
            })
            .catch(async (error)=>{
                // need to return some data from here  for now Just logging the error
                console.log(error);
                otp = Math.floor(1000 + Math.random() * 9000);
                await redisClient.set(`BUSINESS_${req.query.email}`,otp , "EX" , 600);
            });

        const mailOptions = {
            from: process.env.EMAIL,
            to: req.query.email,
            subject: 'OTP To Change Password for Cryptonaukri.com',
            html: `
               <h4>OTP To Change Your Password</h4>
               <h4>You Have 10 mins to validate this OTP</h4>
               <h4>${otp}</h4>
            `
        }
        transporter.sendMail(mailOptions,(err,data)=>{
            if(err){
                return res.status(400).json({
                    code : "OTP_FAILED",
                    otpSent : false,
                    message : "Failed To send OTP"
                });
            }else{
                return res.status(200).json({
                    code : "OTP_SENT",
                    otpSent : true,
                    message : "OTP sent"
                });
            }
        });

    }else{
        return res.status(404).json({
            userLoggedIn : false ,
            code : "NOT_FOUND" ,
            message : "user with such email does not exist"
        });
    }
}

exports.forgetPassword = async (req,res)=>{
    redisClient.get(`BUSINESS_${req.body.email}`)
        .then(async (data) =>{
            if(Number(data)===req.body.otp){
                const user = await businessDatabase.findOne({email : req.body.email});
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.newPassword, salt);
                try {
                    await businessDatabase.updateOne({email : req.body.email} ,user);
                    return res.status(200).json({
                        changedPassword : true ,
                        code : "CHANGED_PASSWORD",
                        message  : "changed the current password"
                    });
                }catch (e) {
                    return res.status(400).json({
                        changedPassword : false ,
                        code : "ERROR",
                        message  : "An error occurred while changing the password"
                    });
                }
            }else{
                return res.status(400).json({
                    code : "WRONG_OTP",
                    userAdded : false,
                    message : "Wrong OTP"
                });
            }
        })
        .catch(error =>{
            console.log(error);
            return res.status(400).json({
                changedPassword : false ,
                code : "ERROR",
                message  : "An error occurred while comparing retrieving the otp to change the password"
            });
        });
}
exports.businessDetails = async (req,res)=>{
    const business = await businessDatabase.findOne({email : req.query.email});
    if(business){
        const jobsAdded = await jobsDatabase.find({postedBy: business._id});
        const {executiveName , officialEmail , companyName , description , establishedYear
            , headquarters , websiteLink } = business;
        return res.status(200).json({
            userFound : true ,
            details : {executiveName,officialEmail,companyName,description,establishedYear,headquarters,websiteLink , jobsAdded }
        });
    }else{
        return res.status(400).json({
            userFound : false ,
            details : null ,
            message : "No business is associated with this email ID"
        });
    }
}

exports.loggedInBusinessDetails = async (req,res)=> {
    //adding safety check so that user cannot access this endpoint
    const jobsAdded = await jobsDatabase.find({postedBy: req.user._id});
    const {executiveName , officialEmail , companyName , description , establishedYear
        , headquarters , websiteLink , password , GSTIN} = req.user;

    return res.status(200).json({executiveName , officialEmail , companyName , description , establishedYear
        , headquarters , websiteLink , password, GSTIN , jobsAdded  });
}




