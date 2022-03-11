const userDatabase = require("../models/user/userSchema");
const otpDatabase = require("../models/otpModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Redis = require("ioredis");
const redisClient = new Redis(process.env.REDIS);


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
                otp = Math.floor(1000 + Math.random() * 9000);
                await redisClient.set(req.query.email,otp , "EX" , 600);
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
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(req.body.password , salt );
                const userDataToBeSaved = {
                    firstName : req.body.firstName,
                    lastName : req.body.lastName,
                    email : req.body.email,
                    password : hashedPassword,
                    location : req.body.location,
                    phoneNumber : req.body.phoneNumber
                };
                try{
                    await userDatabase.create(userDataToBeSaved);
                    res.status(201).json({
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
            message : "user with such username does not exist"
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


