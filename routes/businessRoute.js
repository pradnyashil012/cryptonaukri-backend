const express = require("express");
const router = express.Router();
const {verifyJWT} = require("../middleware/jwtAuthentication");
const {sendOTP, businessSignup, businessLogin, forgetPasswordOTP, forgetPassword, changePassword, businessDetails,
    loggedInBusinessDetails, ownerOTPGeneration, businessProfileUpdate,businessDetailsByID
} = require("../controller/businessController");
const {businessOnly} = require("../middleware/authorizationMiddlewares");

router.route("/otp")
    .get(sendOTP);
router.route("/signup")
    .post(businessSignup);
router.route("/login")
    .post(businessLogin);
router.route("/forgetPasswordOTP")
    .get(forgetPasswordOTP);
router.route("/forgetPassword")
    .post(forgetPassword);
router.route("/businessDetails")
    .get(businessDetails);
router.route("/businessDetailsID")
    .get(businessDetailsByID);
router.route("/loggedInBusinessDetails")
    .get(verifyJWT,loggedInBusinessDetails);
router.route("/changePassword")
    .post(verifyJWT,changePassword);
router.route("/owner")
    .post(ownerOTPGeneration);

router.route("/updateProfile")
    .put([verifyJWT,businessOnly],businessProfileUpdate);

//Test Route
router.route("/test")
    .get(verifyJWT , async (req, res) => {
        console.log(req.originalUrl)
        return res.json(req.user);
    });


module.exports = router;