const jwt = require("jsonwebtoken");
const userDatabase = require("../models/user/userSchema");
const businessDatabase = require("../models/business/businessSchema");

exports.verifyJWT = async (req,res,next)=>{
    const token = req.header("Authorization");
    if(!token){
        return res.status(400).json({
            code : "JWT_NOT_FOUND",
            message : "JWT was not present in header"
        });
    }
    if(!token.startsWith("Bearer ")){
        return res.status(401).json({
            code : "JWT_FORMAT_ERROR",
            message : "JWT has not been passed with proper format in header"
        });
    }
    try{
        const jwtVerify = jwt.verify(token.substring(7,token.length) , process.env.JWT_KEY);
        if(jwtVerify.userID){
            req.user = await userDatabase.findById(jwtVerify.userID);
            if(req.user.accountDisableDate < Date.now()  ||  req.user.isDisabled){
                req.user.isDisabled = true;
                await userDatabase.findByIdAndUpdate(req.user._id , req.user);
                return res.status(400).json({
                    code : "INVALID",
                    message : "Account has been disabled(free trial period expired)"
                });
            }
            next();
        }else if(jwtVerify.businessID){
            req.user = await businessDatabase.findById(jwtVerify.businessID);
            next();
        }
    }catch (e) {
        console.log(e);
        return res.status(401).json({
            code : "INVALID_TOKEN",
            message : "Passed in JWT is invalid"
        });
    }
}