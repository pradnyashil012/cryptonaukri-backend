const express = require("express");
const router = express.Router();
const {userSignup , userLogin, sendOTP} = require("../controller/userController");
const {verifyJWT} = require("../middleware/jwtAuthentication");

router.route("/signup")
    .post(userSignup);
router.route("/login")
    .post(userLogin);
router.route("/otp")
    .get(sendOTP);

//Test Route
router.route("/test")
    .get(verifyJWT , async (req, res) => {return res.json(req.user)});

module.exports = router;