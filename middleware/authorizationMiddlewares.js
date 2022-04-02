exports.userOnly = async (req,res,next)=>{
    if(req.user.ROLE==="USER"){
        next();
    }else{
        return res.status(403).json({
            code : "NOT_ELIGIBLE",
            appliedAtJob : false,
            message : "You are not eligible to visit this endpoint"
        });
    }
}

exports.businessOnly = async (req,res,next)=>{
    if(req.user.ROLE==="BUSINESS"){
        next();
    }else{
        return res.status(403).json({
            code : "NOT_ELIGIBLE",
            appliedAtJob : false,
            message : "You are not eligible to visit this endpoint"
        });
    }
}

exports.adminOnly = async (req,res,next)=>{
    if(req.user.ROLE==="ADMIN"){
        next();
    }else{
        return res.status(403).json({
            code : "NOT_ELIGIBLE",
            appliedAtJob : false,
            message : "You are not eligible to visit this endpoint"
        });
    }
}