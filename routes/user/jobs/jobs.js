const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const router = new express.Router()

const user_schema = require('../../../models/user/schema/userSchema')




router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json());

router.get('/user/jobs/jobsapplied/:id', async(req, res) => {

    const id = req.params.id.toString();
    const job = await user_schema.findById(id)


    return res.send(job.job_id)

})

router.post('/user/jobs/apply-job/:id', async(req, res) => {
    const id = req.params.id.toString();
    const userId = req.body.userId;
    const user = await user_schema.findById(userId);


    user.job_id.push(id);
    user.save();
    res.send(user)


})







module.exports = router