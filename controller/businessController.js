const businessDatabase = require("../models/business/businessSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Redis = require("ioredis");
const redisClient = new Redis(process.env.REDIS);
const jobsDatabase = require("../models/business/jobSchema");
const internshipDatabase = require("../models/business/internshipSchema");
const businessCouponDatabase = require("../models/businessCouponModel");
const couponGeneration = require("../utils/couponKeyGenerationForBusiness");
const jobAnswersDatabase = require("../models/user/userAnswersModel");
const internshipAnswersDatabase = require("../models/user/userAnswersInternship");
const userDatabase = require("../models/user/userSchema");
const otpTemplate = require("../utils/OtpEmail");
const { sendEmailAfterBusinessSignup } = require("../utils/sendEmailFunctions");

exports.sendOTP = async (req, res) => {
  const businessPresenceCheck = await businessDatabase.findOne({
    officialEmail: req.query.email,
  });
  if (!businessPresenceCheck) {
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
      .get(`BUSINESS_${req.query.email}`)
      .then(async (data) => {
        if (data) {
          otp = Number(data);
        } else {
          otp = Math.floor(1000 + Math.random() * 9000);
          await redisClient.set(`BUSINESS_${req.query.email}`, otp, "EX", 600);
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
      subject: "Business Email verification for Cryptonaukri.com",
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

exports.businessSignup = async (req, res) => {
  const businessCoupon = await businessCouponDatabase.findOne({
    coupon: req.query.coupon,
  });
  if (businessCoupon) {
    if (!businessCoupon.businessAssociated) {
      redisClient
        .get(`BUSINESS_${req.body.officialEmail}`)
        .then(async (data) => {
          if (Number(data) === req.body.otp) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            const businessDataToBeSaved = {
              executiveName: req.body.executiveName,
              officialEmail: req.body.officialEmail,
              password: hashedPassword,
              companyName: req.body.companyName,
              description: req.body.description,
              establishedYear: req.body.establishedYear,
              GSTIN: req.body.GSTIN,
              headquarters: req.body.headquarters,
              phoneNumber: req.body.phoneNumber,
              websiteLink: req.body.websiteLink,
            };
            try {
              await businessDatabase.create(businessDataToBeSaved);
              const businessCoupon = await businessCouponDatabase.findOne({
                coupon: req.query.coupon,
              });
              businessCoupon.businessAssociated = req.body.officialEmail;
              await businessCouponDatabase.findByIdAndUpdate(
                businessCoupon._id,
                businessCoupon
              );
              try {
                sendEmailAfterBusinessSignup(businessDataToBeSaved);
              } catch (e) {
                console.log(e); // basically we don't want our user to think they have not got registered bcuz this function didn't run properly
              }
              return res.status(201).json({
                code: "BUSINESS_ADDED",
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

exports.businessLogin = async (req, res) => {
  const business = await businessDatabase.findOne({
    officialEmail: req.body.email,
  });
  if (!business) {
    return res.status(404).json({
      userLoggedIn: false,
      code: "NOT_FOUND",
      message: "Business with such email does not exist",
    });
  }
  const validatePassword = await bcrypt.compare(
    req.body.password,
    business.password
  );
  if (!validatePassword) {
    return res.status(400).json({
      userLoggedIn: false,
      code: "WRONG_PASSWORD",
      message: "business's entered password was wrong",
    });
  }
  if (business.accountDisableDate < Date.now() && !business.isDisabled) {
    business.isDisabled = true;
    await businessDatabase.findByIdAndUpdate(business._id, business);
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
      businessID: business._id,
      ROLE: "BUSINESS",
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
      message: "Business Logged In Successfully",
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
    await businessDatabase.findByIdAndUpdate(req.user._id, req.user);
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
  const business = await businessDatabase.findOne({
    officialEmail: req.query.email,
  });
  if (business) {
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
      .get(`BUSINESS_${req.query.email}`)
      .then(async (data) => {
        if (data) {
          otp = Number(data);
        } else {
          otp = Math.floor(1000 + Math.random() * 9000);
          await redisClient.set(`BUSINESS_${req.query.email}`, otp, "EX", 600);
        }
      })
      .catch(async (error) => {
        // need to return some data from here  for now Just logging the error
        console.log(error);
        otp = Math.floor(1000 + Math.random() * 9000);
        await redisClient.set(`BUSINESS_${req.query.email}`, otp, "EX", 600);
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
    .get(`BUSINESS_${req.body.email}`)
    .then(async (data) => {
      if (Number(data) === req.body.otp) {
        const user = await businessDatabase.findOne({
          officialEmail: req.body.email,
        });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.newPassword, salt);
        try {
          await businessDatabase.updateOne(
            { officialEmail: req.body.email },
            user
          );
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
exports.businessDetails = async (req, res) => {
  try {
    const business = await businessDatabase.findOne({
      officialEmail: req.query.email,
    });
    if (business) {
      const jobsAdded = await jobsDatabase.find({ postedBy: business._id });
      const {
        executiveName,
        officialEmail,
        companyName,
        description,
        establishedYear,
        headquarters,
        websiteLink,
      } = business;
      return res.status(200).json({
        userFound: true,
        details: {
          executiveName,
          officialEmail,
          companyName,
          description,
          establishedYear,
          headquarters,
          websiteLink,
          jobsAdded,
        },
      });
    } else {
      return res.status(400).json({
        userFound: false,
        details: null,
        message: "No business is associated with this email ID",
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
exports.businessDetailsByID = async (req, res) => {
  try {
    const business = await businessDatabase.findById(req.query.businessID);
    if (business) {
      const { executiveName, officialEmail, _id, websiteLink } = business;
      return res.status(200).json({
        userFound: true,
        details: { executiveName, officialEmail, websiteLink, _id },
      });
    } else {
      return res.status(400).json({
        userFound: false,
        details: null,
        message: "No business is associated with this email ID",
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

exports.loggedInBusinessDetails = async (req, res) => {
  if (req.user.ROLE === "BUSINESS") {
    try {
      const jobsAdded = await jobsDatabase.find({
        postedBy: req.user._id,
        hasBeenApproved: true,
      });

      const {
        executiveName,
        officialEmail,
        companyName,
        description,
        establishedYear,
        headquarters,
        websiteLink,
        GSTIN,
      } = req.user;
      const internshipsAdded = await internshipDatabase.find({
        postedBy: req.user._id,
        hasBeenApproved: true,
      });

      return res.status(200).json({
        executiveName,
        officialEmail,
        companyName,
        description,
        establishedYear,
        headquarters,
        websiteLink,
        GSTIN,
        jobsAdded,
        internshipsAdded,
      });
    } catch (e) {
      console.log(e);
      return res.status(400).json({
        code: "ERROR",
        message: "some error occurred while fetching the data",
      });
    }
  } else {
    return res.status(403).json({
      code: "NOT_ELIGIBLE",
      appliedAtJob: false,
      message: "You are not eligible to apply at current job",
    });
  }
};

exports.getInternshipDetails = async (req, res) => {
  if (req.user.ROLE === "BUSINESS") {
    const { id } = req.query;

    let business = await internshipDatabase.findOne({
      _id: id,
      postedBy: req.user._id,
    });

    if (!business) {
      business = await jobsDatabase.findOne({
        _id: id,
        postedBy: req.user._id,
      });
    }

    if (!business) {
      return res.status(404).json({
        message: "Internship not found",
        code: "INTERNSHIP_NOT_FOUND",
        isInternshipFound: false,
      });
    }

    let details = await internshipAnswersDatabase.findAll({
      internshipAssociated: id,
    });

    if (details.length == 0) {
      details = await jobAnswersDatabase.findAll({ jobAssociated: id });
    }
    return res.status(200).json({
      message: "Internship found",
      code: "INTERNSHIP_FOUND",
      isInternshipFound: true,
      data: details,
    });
  } else {
    return res.status(403).json({
      message: "Sorry You are not authorized to access this endpoint",
    });
  }
};

exports.ownerOTPGeneration = async (req, res) => {
  if (
    req.body.username === process.env.OWNER_USERNAME &&
    req.body.password === process.env.OWNER_PASSWORD
  ) {
    const couponCode = await couponGeneration();
    return res.status(201).json({
      couponCode,
      message: "Coupon Code generated",
    });
  } else {
    return res.status(403).json({
      message: "Sorry You are not authorized to access this endpoint",
    });
  }
};

exports.businessProfileUpdate = async (req, res) => {
  try {
    const updatedBusinessProfile = await businessDatabase.findByIdAndUpdate(
      req.user._id,
      req.body,
      { new: true }
    );
    return res.status(200).json({
      message: "Business Profile updated",
      code: "BUSINESS_PROFILE_UPDATED",
      isProfileUpdated: true,
      data: updatedBusinessProfile,
    });
  } catch (e) {
    return res.status(400).json({
      message: "Business Profile update failed",
      code: "PROFILE_UPDATE_FAILED",
      isProfileUpdated: false,
    });
  }
};

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
