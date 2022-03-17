const express = require("express");
const router = express.Router();
const {postJob, findJobs, applyJob} = require("../controller/jobsController");
const {verifyJWT} = require("../middleware/jwtAuthentication");


router.route("/postJob")
    .post(verifyJWT,postJob);
router.route("/findJob")
    .get(findJobs);
router.route("/applyJob")
    .post(verifyJWT,applyJob);

module.exports = router;