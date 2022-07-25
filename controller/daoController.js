const businessDatabase = require("../models/business/businessSchema");
const daoDatabase = require("../models/dao/daoSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Redis = require("ioredis");
const redisClient = new Redis(process.env.REDIS);
const jobsDatabase = require("../models/business/jobSchema");
const internshipDatabase = require("../models/business/internshipSchema");
const daoCouponDatabase = require("../models/dao/daoCouponModel");
const couponGeneration = require("../utils/couponKeyGenerationForBusiness");
const userDatabase = require("../models/user/userSchema");
const otpTemplate = require("../utils/OtpEmail");
const { sendEmailAfterDaoSignup } = require("../utils/sendEmailFunctions");

exports.sendOTP = async (req, res) => {
  const daoPresenceCheck = await daoDatabase.findOne({
    officialEmail: req.query.email,
  });
  if (!daoPresenceCheck) {
    const transporter = nodemailer.createTransport({
      service: "smtp",
      host: process.env.EMAIL_HOST,
      name: process.env.EMAIL_NAME,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    let otp = 0;
    await redisClient
      .get(`DAO_${req.query.email}`)
      .then(async (data) => {
        if (data) {
          otp = Number(data);
        } else {
          otp = Math.floor(1000 + Math.random() * 9000);
          await redisClient.set(`DAO_${req.query.email}`, otp, "EX", 600);
        }
      })
      .catch(async (error) => {
        console.log(error);
        return res.status(400).json({
          code: "OTP_FAILED",
          otpSent: false,
          message: "Failed To set OTP",
        });
      });
    const mailOptions = {
      from: process.env.EMAIL,
      to: req.query.email,
      subject: "DAO Email verification for Cryptonaukri.com",
      html: otpTemplate(otp, 1),
    };
    await transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        return res.status(400).json({
          code: "OTP_FAILED",
          otpSent: false,
          message: "Failed To send OTP",
        });
      } else {
        return res.status(200).json({
          code: "OTP_SENT",
          otpSent: true,
          message: "OTP sent",
        });
      }
    });
  } else {
    return res.status(400).json({
      code: "DUPLICATE",
      userAdded: false,
      message: "Email ID already exists",
    });
  }
};

exports.daoSignup = async (req, res) => {
  const daoCoupon = await daoCouponDatabase.findOne({
    coupon: req.query.coupon,
  });
  if (daoCoupon) {
    if (!daoCoupon.daoAssociated) {
      redisClient
        .get(`DAO_${req.body.officialEmail}`)
        .then(async (data) => {
          if (Number(data) === req.body.otp) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            const daoDataToBeSaved = {
              daoName: req.body.daoName,
              websiteLink: req.body.websiteLink,
              representativeName: req.body.representativeName,
              officialEmail: req.body.officialEmail,
              password: hashedPassword,
              phoneNumber: req.body.phoneNumber,
            };
            try {
              await daoDatabase.create(daoDataToBeSaved);
              const daoCoupon = await daoCouponDatabase.findOne({
                coupon: req.query.coupon,
              });
              daoCoupon.daoAssociated = req.body.officialEmail;
              await daoCouponDatabase.findByIdAndUpdate(
                daoCoupon._id,
                daoCoupon
              );
              try {
                sendEmailAfterDaoSignup(daoDataToBeSaved);
              } catch (e) {
                console.log(e); // basically we don't want our user to think they have not got registered bcuz this function didn't run properly
              }
              return res.status(201).json({
                code: "DAO_ADDED",
                userAdded: true,
                message: "Business has been added successfully",
              });
            } catch (error) {
              // Need to make this error more specific.
              return res.status(400).json({
                code: "DUPLICATE",
                userAdded: false,
                message: "Email ID already exists",
              });
            }
          } else {
            return res.status(400).json({
              code: "WRONG_OTP",
              userAdded: false,
              message: "Wrong OTP",
            });
          }
        })
        .catch((error) => {
          console.log(error);
          return res.status(400).json({
            code: "OTP_RETRIEVAL",
            userAdded: false,
            message: "some error occurred while retrieving the OTP",
          });
        });
    } else {
      return res.status(400).json({
        code: "COUPON_USED",
        userAdded: false,
        message:
          "sorry coupon which you are trying to use is associated with someone else",
      });
    }
  } else {
    return res.status(400).json({
      code: "WRONG_COUPON",
      userAdded: false,
      message: "sorry coupon which you are trying to use does not exist",
    });
  }
};

exports.daoLogin = async (req, res) => {
  const dao = await daoDatabase.findOne({
    officialEmail: req.body.email,
  });
  if (!dao) {
    return res.status(404).json({
      userLoggedIn: false,
      code: "NOT_FOUND",
      message: "Dao with such email does not exist",
    });
  }
  const validatePassword = await bcrypt.compare(
    req.body.password,
    dao.password
  );
  if (!validatePassword) {
    return res.status(400).json({
      userLoggedIn: false,
      code: "WRONG_PASSWORD",
      message: "Dao's entered password was wrong",
    });
  }
  if (dao.accountDisableDate < Date.now() && !dao.isDisabled) {
    dao.isDisabled = true;
    await daoDatabase.findByIdAndUpdate(dao._id, dao);
    // const jobs = await jobsDatabase.find({postedBy : business._id});
    // await asyncForEach(jobs , async (val)=>{
    //     val.isDisabled = true;
    //     const userAnswers = await jobAnswersDatabase.find({jobAssociated : val._id});
    //     userAnswers.forEach(data =>{
    //         data.isDisabled = true;
    //     });
    //     await jobAnswersDatabase.updateMany({jobAssociated : val._id},userAnswers);
    // });
    // await jobsDatabase.updateMany({postedBy : business._id},jobs);
    // const internships = await internshipDatabase.find({postedBy : business._id});
    // await asyncForEach(internships , async (val)=>{
    //     val.isDisabled = true;
    //     const userAnswers = await internshipAnswersDatabase.find({jobAssociated : val._id});
    //     userAnswers.forEach(data =>{
    //         data.isDisabled = true;
    //     });
    //     await internshipAnswersDatabase.updateMany({jobAssociated : val._id},userAnswers);
    // });
    // await internshipDatabase.updateMany({postedBy : business._id} , internships);

    return res.status(400).json({
      code: "INVALID",
      message: "Account has been disabled(free trial period expired)",
    });
  }
  if (business.isDisabled) {
    return res.status(400).json({
      code: "INVALID",
      message: "Account has been disabled(free trial period expired)",
    });
  }

  const token = await jwt.sign(
    {
      daoID: dao._id,
      ROLE: "DAO",
    },
    process.env.JWT_KEY,
    {
      expiresIn: "48h",
    }
  );
  return res
    .status(200)
    .header({
      Authorization: token,
    })
    .json({
      userLoggedIn: true,
      code: "LOGGED_IN",
      message: "Dao Logged In Successfully",
    });
};

exports.changePassword = async (req, res) => {
  const previousPassword = await bcrypt.compare(
    req.body.previousPassword,
    req.user.password
  );
  if (!previousPassword) {
    return res.status(400).json({
      changedPassword: false,
      code: "WRONG_PASSWORD",
      message: "entered previous password is wrong",
    });
  }
  const salt = await bcrypt.genSalt(10);
  req.user.password = await bcrypt.hash(req.body.newPassword, salt);

  try {
    await daoDatabase.findByIdAndUpdate(req.user._id, req.user);
    return res.status(200).json({
      changedPassword: true,
      code: "CHANGED_PASSWORD",
      message: "changed the current password",
    });
  } catch (e) {
    return res.status(200).json({
      changedPassword: false,
      code: "ERROR",
      message: "An error occurred while updating the password",
    });
  }
};

exports.forgetPasswordOTP = async (req, res) => {
  const dao = await daoDatabase.findOne({
    officialEmail: req.query.email,
  });
  if (dao) {
    const transporter = nodemailer.createTransport({
      service: "smtp",
      host: process.env.EMAIL_HOST,
      name: process.env.EMAIL_NAME,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    let otp = 0;
    await redisClient
      .get(`DAO_${req.query.email}`)
      .then(async (data) => {
        if (data) {
          otp = Number(data);
        } else {
          otp = Math.floor(1000 + Math.random() * 9000);
          await redisClient.set(`DAO_${req.query.email}`, otp, "EX", 600);
        }
      })
      .catch(async (error) => {
        // need to return some data from here  for now Just logging the error
        console.log(error);
        otp = Math.floor(1000 + Math.random() * 9000);
        await redisClient.set(`DAO_${req.query.email}`, otp, "EX", 600);
      });

    const mailOptions = {
      from: process.env.EMAIL,
      to: req.query.email,
      subject: "OTP To Change Password for Cryptonaukri.com",
      html: otpTemplate(otp, 0),
    };
    await transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        return res.status(400).json({
          code: "OTP_FAILED",
          otpSent: false,
          message: "Failed To send OTP",
        });
      } else {
        return res.status(200).json({
          code: "OTP_SENT",
          otpSent: true,
          message: "OTP sent",
        });
      }
    });
  } else {
    return res.status(404).json({
      userLoggedIn: false,
      code: "NOT_FOUND",
      message: "user with such email does not exist",
    });
  }
};

exports.forgetPassword = async (req, res) => {
  redisClient
    .get(`DAO_${req.body.email}`)
    .then(async (data) => {
      if (Number(data) === req.body.otp) {
        const user = await daoDatabase.findOne({
          officialEmail: req.body.email,
        });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.newPassword, salt);
        try {
          await daoDatabase.updateOne({ officialEmail: req.body.email }, user);
          return res.status(200).json({
            changedPassword: true,
            code: "CHANGED_PASSWORD",
            message: "changed the current password",
          });
        } catch (e) {
          return res.status(400).json({
            changedPassword: false,
            code: "ERROR",
            message: "An error occurred while changing the password",
          });
        }
      } else {
        return res.status(400).json({
          code: "WRONG_OTP",
          userAdded: false,
          message: "Wrong OTP",
        });
      }
    })
    .catch((error) => {
      console.log(error);
      return res.status(400).json({
        changedPassword: false,
        code: "ERROR",
        message:
          "An error occurred while comparing retrieving the otp to change the password",
      });
    });
};

exports.daoDetailsByID = async (req, res) => {
  try {
    const dao = await daoDatabase.findById(req.query.daoID);
    if (dao) {
      const { representativeName, daoName, officialEmail, _id, websiteLink } =
        dao;
      return res.status(200).json({
        userFound: true,
        details: {
          representativeName,
          daoName,
          officialEmail,
          websiteLink,
          _id,
        },
      });
    } else {
      return res.status(400).json({
        userFound: false,
        details: null,
        message: "No dao is associated with this email ID",
      });
    }
  } catch (e) {
    return res.status(500).json({
      userFound: false,
      details: null,
      message: "An Error occurred while finding the business data",
    });
  }
};

exports.daoProfileUpdate = async (req, res) => {
  try {
    const updatedDaoProfile = await daoDatabase.findByIdAndUpdate(
      req.user._id,
      req.body,
      { new: true }
    );
    return res.status(200).json({
      message: "Dao Profile updated",
      code: "DAO_PROFILE_UPDATED",
      isProfileUpdated: true,
      data: updatedDaoProfile,
    });
  } catch (e) {
    return res.status(400).json({
      message: "Dao Profile update failed",
      code: "PROFILE_UPDATE_FAILED",
      isProfileUpdated: false,
    });
  }
};
