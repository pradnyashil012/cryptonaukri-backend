const {google} = require("googleapis");
const axios = require("axios");
const userDatabase = require("../models/user/userSchema");
const jwt = require("jsonwebtoken");
const keyGenAndStoreFunc = require("../utils/couponKeyGenerationAndSaving");

const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    `${process.env.CURRENT_URL}/api/v1/user/googleUserInfo`
);

exports.oAuthCall = async (req,res)=>{
   try{
       const scopes = [
           'https://www.googleapis.com/auth/userinfo.profile',
           'https://www.googleapis.com/auth/userinfo.email',
       ];

       const reDirectURL = oAuth2Client.generateAuthUrl({
           access_type: 'offline',
           prompt: 'consent',
           scope: scopes,
       });
       return res.status(200).json({
           message : "OAuth Redirect URL",
           code : "OAUTH_SUCCESS",
           reDirectURL
       });
   }catch (e) {
       console.log(e);
       return res.status(400).json({
           message : "Some Error Occurred While Login/Signup",
           code : "FAILED_LOG_IN",
           userLoggedIn : false
       });
   }
}
exports.googleUserInfo = async (req,res)=>{
    try{
        const data = await getGoogleUser(req.query.code);
        // console.log(data);
        await signUpOrSignInUser(data.email,data.given_name,req,res);
    }catch (e) {
        console.log(e);
        return res.status(400).json({
            message : "Some Error Occurred While Login/Signup",
            code : "FAILED_LOG_IN",
            userLoggedIn : false
        });
    }
}



exports.githubOAuthCall = async (req,res)=>{
    try{
        const data = await axios.get(`https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_url=${process.env.GITHUB_REDIRECT}&scope=read:user,user:email`);
        return res.status(200).json({
            message : "OAuth Redirect URL",
            code : "OAUTH_SUCCESS",
            reDirectURL : data.request.res.responseUrl
        });
    }catch (e) {
        console.log(e);
        return res.status(400).json({
            message : "Some Error Occurred While Login/Signup",
            code : "FAILED_LOG_IN",
            userLoggedIn : false
        });
    }
}

exports.githubUserInfo = async (req,res)=>{
   try{
       const code = req.query.code;
       const accessTokenResponse = await axios.post(`https://github.com/login/oauth/access_token?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}&redirect_url=${process.env.GITHUB_REDIRECT}&code=${code}`,{
           headers : {
               Accept : "application/json"
           }
       });
       let accessToken = accessTokenResponse.data;
       accessToken=accessToken.split("=")[1].split("&")[0]
       const userData = await axios.get("https://api.github.com/user",{
           headers : {
               Authorization : `token ${accessToken}`
           }
       });
       const userDataEmail = await axios.get("https://api.github.com/user/emails",{
           headers : {
               Authorization : `token ${accessToken}`
           }
       });
       await signUpOrSignInUser(userDataEmail.data[0].email,userData.data.name,req,res);
   }catch (e) {
       console.log(e);
       return res.status(400).json({
           message : "Some Error Occurred While Login/Signup",
           code : "FAILED_LOG_IN",
           userLoggedIn : false
       });
   }
}

exports.linkedinOAuthCall = async (req,res)=>{
    try{
        const data = await axios.get(`https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${process.env.LINKEDIN_REDIRECT}&scope=r_liteprofile%20r_emailaddress&state`);
        return res.status(200).json({
            message : "OAuth Redirect URL",
            code : "OAUTH_SUCCESS",
            reDirectURL : data.request.res.responseUrl
        });
    }catch (e) {
        console.log(e);
        return res.status(400).json({
            message : "Some Error Occurred While Login/Signup",
            code : "FAILED_LOG_IN",
            userLoggedIn : false
        });
    }
}

exports.linkedinUserInfo = async (req,res)=>{
    try{
        const code = req.query.code;
        // console.log(code);
        const accessTokenResponse = await axios.post(`https://www.linkedin.com/oauth/v2/accessToken?client_id=${process.env.LINKEDIN_CLIENT_ID}&client_secret=${process.env.LINKEDIN_CLIENT_SECRET}&redirect_uri=${process.env.LINKEDIN_REDIRECT}&code=${code}&grant_type=authorization_code`,{
            headers : {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
        const accessToken = accessTokenResponse.data.access_token;

        const userData = await axios.get("https://api.linkedin.com/v2/me",{
            headers : {
                Authorization : `Bearer ${accessToken}`
            }
        });

        const userEmailData = await axios.get("https://api.linkedin.com/v2/clientAwareMemberHandles?q=members&projection=(elements*(primary,type,handle~))",{
            headers : {
                Authorization : `Bearer ${accessToken}`
            }
        });
        let userEmail = userEmailData.data.elements[0];
        userEmail = userEmail["handle~"].emailAddress;
        await signUpOrSignInUser(userEmail,userData.data.localizedFirstName,req,res);
    }catch (e) {
        console.log(e);
        return res.status(400).json({
            message : "Some Error Occurred While Login/Signup",
            code : "FAILED_LOG_IN",
            userLoggedIn : false
        });
    }
}


const signUpOrSignInUser = async (email,given_name,req,res)=>{
    let user = await userDatabase.findOne({email : email});
    if(user){
        if(user.accountDisableDate < Date.now() && !user.isDisabled){
            return res.status(400).json({
                code : "INVALID",
                userLoggedIn : false,
                message : "Account has been disabled(free trial period expired)"
            });
        }
    }else{
        const userDataToBeSaved = {
            firstName : given_name,
            lastName : null,
            email : email,
            password : null,
            location : null,
            phoneNumber : null
        };
        userDataToBeSaved.couponCode = await keyGenAndStoreFunc(email);
        user = await userDatabase.create(userDataToBeSaved);
    }
    const token = await jwt.sign({
        userID : user._id,
        ROLE : "USER"
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

async function getGoogleUser(code) {
    const { tokens } = await oAuth2Client.getToken(code);
    // console.log(tokens);
    const googleUser = await axios
        .get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`,
            {
                headers: {
                    Authorization: `Bearer ${tokens.id_token}`,
                },
            },
        )
        .then(res => res.data)
        .catch(error => {
            console.log(error);
        });
    return googleUser;
}

/*
[
    {
    email: 'prateekkumartiwari01@gmail.com',
    primary: true,
    verified: true,
    visibility: 'private'
    }
]
 */


/*
console.log(tokens)
    {
  access_token: 'ya29.A0ARrdaM8GPx2ixIU44cdOQj9X5ElsoAlVIw_JR8Gc_kfmvTOJhJdF3KxXPxVITp6ezyDsTFCLZ1-xXQA3tWo2AMq-VGVNVQjUqe_HQCQiDvHyXMhHxPUyxEGcqiDF58YxQ0JVTXP_oSFpTvvEVkNefU3riuxf',
  refresh_token: '1//0gWFD75D0hxxtCgYIARAAGBASNwF-L9IrNysfuGlRBo2rP6a1YOtjervqtgULpksw4dgQS4gZPJfNuOxQUuC5dA1trQUYlh9w4Aw',
  scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
  token_type: 'Bearer',
  id_token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImQzMzJhYjU0NWNjMTg5ZGYxMzNlZmRkYjNhNmM0MDJlYmY0ODlhYzIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20i
    LCJhenAiOiI5NDE4NTU5ODg3NjktcjdmOXN0N2gycDg0dDNmMTcxZzA0cnF0Y3A4ZXZsZzguYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI5NDE4NTU5ODg3NjktcjdmOXN0N2gycDg0dDNmMTcxZzA0
    cnF0Y3A4ZXZsZzguYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDI4OTk4ODkzNDgwNDc2NzY1MzIiLCJlbWFpbCI6ImVuZm9yYzNyckBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwi
    YXRfaGFzaCI6Ikh6Q0VpRU1WT1hRSWR2Y1M4dUFzTUEiLCJuYW1lIjoiRW5mb3JjM3JyIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hLS9BT2gxNEdoajNsYkVtbFlSNHJQUENV
    MnZQR2ZHbUd2MXUxWnNrWlc2S1dKaz1zOTYtYyIsImdpdmVuX25hbWUiOiJFbmZvcmMzcnIiLCJsb2NhbGUiOiJlbi1HQiIsImlhdCI6MTY1MDcwNzI4MywiZXhwIjoxNjUwNzEwODgzfQ.XC5qkORy_4C0UNNSQds1D
    6lrTa1TtQUi23LN42ndUwkivcaNKzhg0rz7uHH_tkEse3cqTkSlsiN84dq6br-OxJjJFOfh0__ha9jd3dUhGMhJ1yMPq9hQmcTPiNYC-SbUvKons8M5AfgaHa8yZ2H76KWf7ERVHQ2CMf1S_y_vsIGwuyUqYoP7LpB5xsRHZOgiPywPaGPgNTTtlnF-g4vg3FcQe1ze-WHf_gvCwl-8u5CRErSp33OXhRCL0iXmuFayuPg2l9MKmJHhK9xKylF0Ck7gcq1wYFkDYaD7Ps95sbY8HantF4U6hS74nzuM3ON0FkzF7bNR19kg_IZhsPHbGQ',
  expiry_date: 1650710883567
}
    console.log(data);
    {
      id: '108023464997906079683',
      email: 'emailfortestingpurpose123@gmail.com',
      verified_email: true,
      name: 'Test Email',
      given_name: 'Test',
      family_name: 'Email',
      picture: 'https://lh3.googleusercontent.com/a/AATXAJzIxmrPzI9NIaSSWWvK4_hvSXXFz1NJEyj_GNDl=s96-c',
      locale: 'en'
    }
 */
