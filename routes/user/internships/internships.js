const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const router = new express.Router()

const user_schema = require('../../../models/user/schema/userSchema')





router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json());


router.get('/user/internships/internshipsapplied/:id', async(req, res) => {

    const id = req.params.id.toString();
    const job = await user_schema.findById(id)


    return res.send(job.internship_id)



})

router.post('/user/internships/apply-internship/:id', async(req, res) => {
    const id = req.params.id.toString();
    const userId = req.body.userId;
    const user = await user_schema.findById(userId);


    user.internship_id.push(id);
    user.save();
    res.send(user)


})





module.exports = router