const express = require("express");
const router = express.Router();
const { verifyJWT } = require("../middleware/jwtAuthentication");
const { daoOnly } = require("../middleware/authorizationMiddlewares");
const {
  sendOTP,
  daoSignup,
  daoLogin,
  daoDetailsByID,
  daoProfileUpdate,
  forgetPasswordOTP,
  forgetPassword,
  changePassword,
} = require("../controller/daoController");

router.route("/otp").get(sendOTP);
router.route("/signup").post(daoSignup);
router.route("/login").post(daoLogin);
router.route("/forgetPasswordOTP").get(forgetPasswordOTP);
router.route("/forgetPassword").post(forgetPassword);
router.route("/daoDetailsID").get(daoDetailsByID);
router.route("/updateDaoProfile").put([verifyJWT, daoOnly], daoProfileUpdate);
router.route("/changePassword").post(verifyJWT, changePassword);

//Test Route
router.route("/test").get(verifyJWT, async (req, res) => {
  console.log(req.originalUrl);
  return res.json(req.user);
});

module.exports = router;
