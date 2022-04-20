const {google} = require("googleapis");
const axios = require("axios");
const userDatabase = require("../models/user/userSchema");
const jwt = require("jsonwebtoken");

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
       console.log("OAUTH CALL");
       console.log(e);
   }
}
exports.googleUserInfo = async (req,res)=>{
    const data = await getGoogleUser(req.query.code);
    // console.log(data);
    const user = await userDatabase.findOne({email : data.email});
    if(user){
        if(user.accountDisableDate < Date.now() && !user.isDisabled){
            return res.status(400).json({
                code : "INVALID",
                userLoggedIn : false,
                message : "Account has been disabled(free trial period expired)"
            });
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
    }else{
        console.log("create a new user");
    }
}

async function getGoogleUser(code) {
    const { tokens } = await oAuth2Client.getToken(code);
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