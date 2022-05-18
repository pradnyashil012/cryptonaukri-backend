const express = require("express");
const router = express.Router();
const {postJob, findJobs, applyJob, findJob,deleteJob} = require("../controller/jobsController");
const {verifyJWT} = require("../middleware/jwtAuthentication");
const {businessOnly} = require("../middleware/authorizationMiddlewares");


router.route("/postJob")
    .post(verifyJWT,postJob);
router.route("/findJob")
    .get(findJobs);
router.route("/applyJob")
    .post(verifyJWT,applyJob);
router.route("/findJob/:jobID")
    .get(findJob);
router.route("/deleteJob/:jobID")
    .delete([verifyJWT,businessOnly],deleteJob);

module.exports = router;