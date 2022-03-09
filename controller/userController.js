const userDatabase = require("../models/user/userSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");


exports.userSignup = async (req,res)=>{
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
        await  userDatabase.create(userDataToBeSaved);
        return res.status(201).json({
            errorCode : null,
            userAdded : true,
            message : "user has been created successfully"
        });
    }catch (error) {
        return res.status(400).json({
            errorCode : "DUPLICATE",
            userAdded : false,
            message : "Email ID already exists"
        });
    }
}

exports.userLogin = async (req,res)=>{
    const user = await userDatabase.findOne({email : req.body.email});
    if(!user){
        return res.status(404).json({
            userLoggedIn : false ,
            errorCode : "NOT_FOUND" ,
            message : "user with such username does not exist"
        });
    }
    const validatePassword = await bcrypt.compare(req.body.password , user.password);
    if(!validatePassword){
        return res.status(400).json({
            userLoggedIn : false ,
            errorCode : "WRONG_PASSWORD",
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
        errorCode : null ,
        message : "User Logged In Successfully"
    });
}
