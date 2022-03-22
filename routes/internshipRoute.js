const express = require("express");
const {verifyJWT} = require("../middleware/jwtAuthentication");
const {postInternship, applyInternship, findInternships, findInternship} = require("../controller/internshipController");
const router = express.Router();

router.route("/postInternship")
    .post(verifyJWT,postInternship);
router.route("/applyInternship")
    .post(verifyJWT,applyInternship);

router.route("/findInternship")
    .get(findInternships);
router.route("/findInternship/:internshipID")
    .get(findInternship);


module.exports = router;
