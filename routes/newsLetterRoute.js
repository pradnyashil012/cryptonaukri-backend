const express = require("express");
const {userEmailForNewsLetter, sendUserNewsLetter} = require("../controller/newsLettersController");
const router = express.Router();

router.route("/addUser")
    .post(userEmailForNewsLetter);
router.route("/sendEmails")
    .post(sendUserNewsLetter);

module.exports = router;