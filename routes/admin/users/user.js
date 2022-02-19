const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const router = new express.Router()
const cors = require('cors')
const admin_schema = require('../../../models/admin/schema/admin_schema')
const user_schema = require('../../../models/user/schema/user_schema')




router.use(cors())

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json());



router.get('/admin/users/all-users', async(req, res) => {
    try {
        const users = await user_schema.find({})
        res.send(users)
    } catch (e) {
        res.status(500).send()
    }
})



module.exports = router