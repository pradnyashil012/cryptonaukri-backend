const express = require("express");
const {adminLogin, adminSignup, ownerAdminKeyGeneration, deleteJob, increaseValidity, fetchAdminLogs,
    adminDashBoardData, jobApprovalPart, internshipApprovalPart, generateCustomCoupon
} = require("../controller/adminController");
const {verifyJWT} = require("../middleware/jwtAuthentication");
const {adminOnly} = require("../middleware/authorizationMiddlewares");
const router = express.Router();

router.route("/login")
    .post(adminLogin);
router.route("/signup")
    .post(verifyJWT,adminSignup);
router.route("/validity")
    .post(verifyJWT,increaseValidity);
router.route("/owner")
    .post(ownerAdminKeyGeneration);
router.route("/deleteJob/:jobID")
    .delete(verifyJWT,deleteJob);
router.route("/fetchlogs")
    .get(fetchAdminLogs);


router.route("/customCoupon")
    .post([verifyJWT,adminOnly],generateCustomCoupon);
router.route("/dashboard")
    .get([verifyJWT,adminOnly],adminDashBoardData);
router.route("/jobToApprove/:jobID")
    .post([verifyJWT,adminOnly],jobApprovalPart);
router.route("/internshipToApprove/:internshipID")
    .post([verifyJWT,adminOnly],internshipApprovalPart);

module.exports = router;