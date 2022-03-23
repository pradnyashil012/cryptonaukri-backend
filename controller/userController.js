const userDatabase = require("../models/user/userSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Redis = require("ioredis");
const redisClient = new Redis(process.env.REDIS);
const couponDatabase = require("../models/couponModel");
const keyGenAndStoreFunc = require("../utils/couponKeyGenerationAndSaving");
const userAnswersDatabase = require("../models/user/userAnswersModel");
const userResumeDatabase = require("../models/user/userResumeSchema");


exports.sendOTP = async (req,res)=>{
    const userPresenceCheck = await userDatabase.findOne({email : req.query.email});
    if(!userPresenceCheck){
        const transporter = nodemailer.createTransport({
            service:"gmail",
            auth : {
                user : process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });
        let otp = 0;
        await redisClient.get(req.query.email)
            .then(async (data)=>{
                if(data){
                    otp = Number(data);
                }else{
                    otp = Math.floor(1000 + Math.random() * 9000);
                    await redisClient.set(req.query.email,otp , "EX" , 600);
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
            subject: 'Email verification for Cryptonaukri.com',
            html: `
               <h2>Thanks for registering </h2>
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


exports.userSignup = async (req,res)=>{
    redisClient.get(req.body.email)
        .then( async (data)=> {
            if( Number(data) === req.body.otp){
                if(req.query.coupon){
                    const couponData = await couponDatabase.findOne({ couponCode : req.query.coupon });
                    if(couponData.referredUserEmail.length < 3){
                        const userAssociatedWithCoupon = await userDatabase.findOne({email : couponData.userAssociated});
                        userAssociatedWithCoupon.accountDisableDate = new Date(userAssociatedWithCoupon.accountDisableDate.setDate(userAssociatedWithCoupon.accountDisableDate.getDate() + 14));
                        await userDatabase.findByIdAndUpdate(userAssociatedWithCoupon._id,userAssociatedWithCoupon);
                        couponData.referredUserEmail.push(req.body.email);
                        await couponDatabase.findByIdAndUpdate(couponData._id,couponData);
                    }
                }
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(req.body.password , salt);
                const userDataToBeSaved = {
                    firstName : req.body.firstName,
                    lastName : req.body.lastName,
                    email : req.body.email,
                    password : hashedPassword,
                    location : req.body.location,
                    phoneNumber : req.body.phoneNumber
                };
                /*
                initial thought was to return data code from func and put func below into a while loop with await.
                let couponCode = null;
                while(couponCode != null){
                    couponCode = await keyGenAndStoreFunc(req.body.email);
                }
                But for now we are asynchronously calling the keyGenAndStoreFunc(req.body.email);
                 */
                userDataToBeSaved.couponCode = await keyGenAndStoreFunc(req.body.email);
                try{
                    await userDatabase.create(userDataToBeSaved);
                    return res.status(201).json({
                        code : "USER_ADDED",
                        userAdded : true,
                        message : "user has been added successfully"
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

exports.userLogin = async (req,res)=>{
    const user = await userDatabase.findOne({email : req.body.email});
    if(!user){
        return res.status(404).json({
            userLoggedIn : false ,
            code : "NOT_FOUND" ,
            message : "user with such email does not exist"
        });
    }
    const validatePassword = await bcrypt.compare(req.body.password , user.password);
    if(!validatePassword){
        return res.status(400).json({
            userLoggedIn : false ,
            code : "WRONG_PASSWORD",
            message : "user's entered password was wrong"
        });
    }
    if(user.accountDisableDate < Date.now()){
        return res.status(400).json({
            code : "INVALID",
            userLoggedIn : false,
            message : "Account has been disabled(free trial period expired)"
        });
    }
    const token = await jwt.sign({
        userID : user._id,
    },process.env.JWT_KEY, {
        expiresIn : "48h"
    });
    return res.status(200).header({
        "Authorization" : token
    }).json({
        userLoggedIn : true ,
        code : "LOGGED_IN" ,
        message : "User Logged In Successfully"
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
        await userDatabase.findByIdAndUpdate(req.user._id , req.user);
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
    const user = await userDatabase.findOne({email : req.query.email});
    if(user){
        const transporter = nodemailer.createTransport({
            service:"gmail",
            auth : {
                user : process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });
        let otp = 0;
        await redisClient.get(req.query.email)
            .then(async (data)=>{
                if(data){
                    otp = Number(data);
                }else{
                    otp = Math.floor(1000 + Math.random() * 9000);
                    await redisClient.set(req.query.email,otp , "EX" , 600);
                }
            })
            .catch(async (error)=>{
                // need to return some data from here  for now Just logging the error
                console.log(error);
                otp = Math.floor(1000 + Math.random() * 9000);
                await redisClient.set(req.query.email,otp , "EX" , 600);
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
    redisClient.get(req.body.email)
        .then(async (data) =>{
            if(Number(data)===req.body.otp){
                const user = await userDatabase.findOne({email : req.body.email});
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.newPassword, salt);
                try {
                    await userDatabase.updateOne({email : req.body.email} ,user);
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

exports.userDetails = async (req,res)=>{
    const user = await userDatabase.findOne({email:req.query.email});
    if(user){
        const {firstName , lastName , email , phoneNumber , location } = user;
        return res.status(200).json({
            userFound : true ,
            details : {
                firstName, lastName, email , phoneNumber , location
            }
        });
    }else{
        return res.status(400).json({
            userFound : false ,
            details : null ,
            message : "No user is associated with this email ID"
        });
    }
}
exports.addUserResume = async (req,res)=>{
    try{
        req.body.userAssociated = req.user._id;
        const data = await userResumeDatabase.create(req.body);
        return res.status(201).json({
           resumeAdded : true ,
           code : "RESUME_ADDED",
           data
        });
    }catch (e) {
        res.status(400).json({
            resumeAdded : false ,
            code : "RESUME_NOT_ADDED",
        });
    }
}

exports.loggedInUserDetails = async (req,res)=>{

    const {firstName , lastName , email , phoneNumber , password , location ,
        dateOfJoining , ROLE , couponCode , accountDisableDate , _id}  = await userDatabase.findById(req.user._id);
     const appliedAt = await userAnswersDatabase.find({userAssociated: req.user._id});
     const userResume = await userResumeDatabase.findOne({userAssociated : req.user._id});



     return res.status(200).json({firstName , lastName , email , phoneNumber , password , location , dateOfJoining
        , ROLE , couponCode , accountDisableDate , _id , appliedAt , userResume});
}
