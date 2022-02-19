const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const router = new express.Router()


const resume_schema = require('../../../models/user/resume/resume_schema')


router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json());



router.post('/user/resume/post-resume', async(req, res) => {

    const resume = new resume_schema(req.body)

    try {
        await resume.save()
        res.status(201).send(resume)
    } catch (e) {
        res.status(400).send(e)
    }

})

router.get('/user/resume/get-resume', async(req, res) => {
    const id = req.body.user_id;

    const resume = await resume_schema.findOne({ user_id: id })

    if (resume) {
        res.send(resume)
    } else {
        res.send("No resume found")
    }

})



module.exports = router