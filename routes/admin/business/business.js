const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const router = new express.Router()
const cors = require('cors')
const admin_schema = require('../../../models/admin/schema/admin_schema')
const business_schema = require('../../../models/business/schema/business_schema')

const bcrypt = require('bcrypt')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const path = require('path')
const smtpTransport = require('nodemailer/lib/smtp-transport')
var officialotp, tempemail;

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


router.use(cors())

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json());



router.get('/admin/business/all-business-users', async(req, res) => {
    try {
        const users = await business_schema.find({})
        res.send(users)
    } catch (e) {
        res.status(500).send()
    }
})



module.exports = router