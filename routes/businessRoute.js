const express = require("express");
const router = express.Router();
const {verifyJWT} = require("../middleware/jwtAuthentication");
const {sendOTP, businessSignup, businessLogin, forgetPasswordOTP, forgetPassword, changePassword} = require("../controller/businessController");

router.route("/otp")
    .get(sendOTP);
router.route("/signup")
    .post(businessSignup);
router.route("/login")
    .post(businessLogin);
router.route("/forgotPasswordOTP")
    .get(forgetPasswordOTP);
router.route("/forgetPassword")
    .post(forgetPassword);
router.route("/businessDetails")
    .get();
router.route("/loggedInBusinessDetails")
    .get(verifyJWT);
router.route("/changePassword")
    .post(verifyJWT,changePassword);

//Test Route
router.route("/test")
    .get(verifyJWT , async (req, res) => {
        console.log(req.originalUrl)
        return res.json(req.user);
    });


module.exports = router;