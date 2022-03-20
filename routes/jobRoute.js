const express = require("express");
const router = express.Router();
const {postJob, findJobs, applyJob, findJob} = require("../controller/jobsController");
const {verifyJWT} = require("../middleware/jwtAuthentication");


router.route("/postJob")
    .post(verifyJWT,postJob);
router.route("/findJob")
    .get(findJobs);
router.route("/applyJob")
    .post(verifyJWT,applyJob);
router.route("/findJob/:jobID")
    .get(findJob);

module.exports = router;