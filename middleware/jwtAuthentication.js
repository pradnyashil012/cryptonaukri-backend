const jwt = require("jsonwebtoken");
const userDatabase = require("../models/user/userSchema");
const businessDatabase = require("../models/business/businessSchema");
const adminDatabase = require("../models/admin/adminSchema");
const daoDatabase = require("../models/dao/daoSchema");

exports.verifyJWT = async (req, res, next) => {
  const token = req.header("Authorization");
  console.log(token);
  if (!token) {
    return res.status(400).json({
      code: "JWT_NOT_FOUND",
      message: "JWT was not present in header",
    });
  }
  if (!token.startsWith("Bearer ")) {
    return res.status(401).json({
      code: "JWT_FORMAT_ERROR",
      message: "JWT has not been passed with proper format in header",
    });
  }
  try {
    const jwtVerify = jwt.verify(
      token.substring(7, token.length),
      process.env.JWT_KEY
    );
    // const endPointAccessed = req.url.split("/")[2];
    if (jwtVerify.userID && jwtVerify.ROLE === "USER") {
      req.user = await userDatabase.findById(jwtVerify.userID);
      if (req.user.accountDisableDate < Date.now() || req.user.isDisabled) {
        req.user = await userDatabase.findById(jwtVerify.businessID);
        if (!req.user.isDisabled && req.user.accountDisableDate < Date.now()) {
          req.user.isDisabled = true;
          await userDatabase.findByIdAndUpdate(req.user._id, req.user);
          return res.status(400).json({
            code: "INVALID",
            message: "Account has been disabled(free trial period expired)",
          });
        } else if (req.user.isDisabled) {
          return res.status(400).json({
            code: "INVALID",
            message: "Account has been disabled(free trial period expired)",
          });
        } else {
          next();
        }
      }
      next();
    } else if (jwtVerify.businessID && jwtVerify.ROLE === "BUSINESS") {
      req.user = await businessDatabase.findById(jwtVerify.businessID);

      if (!req.user.isDisabled && req.user.accountDisableDate < Date.now()) {
        req.user.isDisabled = true;
        await businessDatabase.findByIdAndUpdate(req.user._id, req.user);
        // const jobs = await jobsDatabase.find({postedBy : req.user._id});
        //  await asyncForEach(jobs , async (val)=>{
        //      val.isDisabled = true;
        //      const userAnswers = await jobAnswersDatabase.find({jobAssociated : val._id});
        //      userAnswers.forEach(data =>{
        //         data.isDisabled = true;
        //      });
        //      await jobAnswersDatabase.updateMany({jobAssociated : val._id},userAnswers);
        // });
        // await jobsDatabase.updateMany({postedBy : req.user._id},jobs);
        // const internships = await internshipDatabase.find({postedBy : req.user._id});
        //
        // await asyncForEach(internships , async (val)=>{
        //     val.isDisabled = true;
        //     const userAnswers = await internshipAnswersDatabase.find({jobAssociated : val._id});
        //     userAnswers.forEach(data =>{
        //         data.isDisabled = true;
        //     });
        //     await internshipAnswersDatabase.updateMany({jobAssociated : val._id},userAnswers);
        // });
        // await internshipDatabase.updateMany({postedBy : req.user._id} , internships);

        return res.status(400).json({
          code: "INVALID",
          message: "Account has been disabled(free trial period expired)",
        });
      } else if (req.user.isDisabled) {
        return res.status(400).json({
          code: "INVALID",
          message: "Account has been disabled(free trial period expired)",
        });
      } else {
        next();
      }
    } else if (jwtVerify.adminID && jwtVerify.ROLE === "ADMIN") {
      req.user = await adminDatabase.findById(jwtVerify.adminID);
      next();
    } else if (jwtVerify.daoID && jwtVerify.ROLE === "DAO") {
      req.user = await daoDatabase.findById(jwtVerify.daoID);

      if (!req.user.isDisabled && req.user.accountDisableDate < Date.now()) {
        req.user.isDisabled = true;
        await daoDatabase.findByIdAndUpdate(req.user._id, req.user);

        return res.status(400).json({
          code: "INVALID",
          message: "Account has been disabled(free trial period expired)",
        });
      } else if (req.user.isDisabled) {
        return res.status(400).json({
          code: "INVALID",
          message: "Account has been disabled(free trial period expired)",
        });
      } else {
        next();
      }
    }
  } catch (e) {
    console.log(e);
    return res.status(401).json({
      code: "INVALID_TOKEN",
      message: "Passed in JWT is invalid",
    });
  }
};

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
