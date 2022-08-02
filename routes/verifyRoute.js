const express = require("express");
const { verifyJWT } = require("../middleware/jwtAuthentication");

const router = express.Router();

router.route("/").get([verifyJWT], (_, res) => {
  return res.sendStatus(200);
});

module.exports = router;
