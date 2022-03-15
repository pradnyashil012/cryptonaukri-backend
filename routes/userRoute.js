const express = require("express");
const router = express.Router();
const {userSignup , userLogin, sendOTP, changePassword , forgetPasswordOTP ,forgetPassword, userDetails,
    loggedInUserDetails
} = require("../controller/userController");
const {verifyJWT} = require("../middleware/jwtAuthentication");

router.route("/signup")
    .post(userSignup);
router.route("/login")
    .post(userLogin);
router.route("/otp")
    .get(sendOTP);
router.route("/forgotPassword")
    .post(changePassword);
router.route("/forgetPasswordOTP")
    .get(forgetPasswordOTP);
router.route("/forgetPassword")
    .post(forgetPassword);
router.route("/changePassword")
    .post(verifyJWT,changePassword);
router.route("/userDetails")
    .get(userDetails);
router.route("/loggedInUserDetails")
    .get(verifyJWT,loggedInUserDetails);

//Test Route
router.route("/test")
    .get(verifyJWT , async (req, res) => {

        return res.json(req.user);
    });

module.exports = router;