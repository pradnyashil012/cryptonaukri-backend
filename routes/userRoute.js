const express = require("express");
const router = express.Router();
const {userSignup , userLogin, sendOTP, changePassword , forgetPasswordOTP ,forgetPassword, userDetails,
    loggedInUserDetails, addUserResume, userResumeUpdate, userProfileUpdate
} = require("../controller/userController");
const {verifyJWT} = require("../middleware/jwtAuthentication");
const {userOnly} = require("../middleware/authorizationMiddlewares");
const {oAuthCall, googleUserInfo, githubUserInfo, githubOAuthCall, linkedinOAuthCall} = require("../controller/userSignupOAuth");

router.route("/signup")
    .post(userSignup);
router.route("/login")
    .post(userLogin);
router.route("/googleSignup")
    .get(oAuthCall);
router.route("/githubSignup")
    .get(githubOAuthCall);
router.route("/linkedinSignup")
    .get(linkedinOAuthCall);

router.route("/otp")
    .get(sendOTP);
router.route("/forgetPasswordOTP")
    .get(forgetPasswordOTP);
router.route("/forgetPassword")
    .post(forgetPassword);
router.route("/userDetails")
    .get(userDetails);
router.route("/googleUserInfo")
    .get(googleUserInfo);
router.route("/githubUserInfo")
    .get(githubUserInfo);
router.route("/linkedinInfo")


router.route("/forgotPassword")
    .post([verifyJWT,userOnly],changePassword);
router.route("/changePassword")
    .post([verifyJWT,userOnly],changePassword);
router.route("/loggedInUserDetails")
    .get([verifyJWT,userOnly],loggedInUserDetails);
router.route("/addResume")
    .post([verifyJWT,userOnly],addUserResume);
router.route("/updateResume")
    .put([verifyJWT,userOnly],userResumeUpdate);
router.route("/updateProfile")
    .put([verifyJWT,userOnly],userProfileUpdate);


//Test Route
router.route("/test")
    .get([verifyJWT,userOnly] , async (req, res) => {
        return res.json(req.user);
    });

module.exports = router;