const express = require("express");
const {adminLogin, adminSignup, ownerAdminKeyGeneration, deleteJob} = require("../controller/adminController");
const {verifyJWT} = require("../middleware/jwtAuthentication");
const router = express.Router();

router.route("/login")
    .post(adminLogin);
router.route("/signup")
    .post(verifyJWT,adminSignup);
router.route("/owner")
    .post(ownerAdminKeyGeneration);
router.route("/deleteJob/:jobID")
    .delete(verifyJWT,deleteJob);

module.exports = router;