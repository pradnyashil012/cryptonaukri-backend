const express = require("express")
const router = new express.Router()

const cors = require("cors")
const mongoose = require('mongoose')
const { assert } = require("console")

const job_schema = require('../../../models/business/jobs-internships/job_schema')

router.use(express.urlencoded({ extended: true }))
router.use(express.json())
router.use(cors())


// To check server

router.get("/basic", cors(), async(req, res) => {
    res.send("Working")
})




// To get all jobs

router.get('/admin/jobs/all-jobs', async(req, res) => {

    // res.send('Hi');
    try {
        const tasks = await job_schema.find({})
        res.send(tasks)
    } catch (e) {
        res.status(500).send()
    }
})

//find specific job
router.get('/admin/jobs/find/:id', async(req, res) => {


    const id = req.params.id.toString();

    const id2 = id.slice(1);

    try {
        const tasks = await job_schema.find({ "_id": id })
            // console.log(req.params.srNo)

        res.send(tasks)
    } catch (e) {
        res.status(500).send()
    }
})




//find specific job & update it by value passed in req

router.post('/admin/jobs/change-status/:id', async(req, res) => {

    const id = req.params.id.toString();
    const { verify } = req.body.verify

    try {
        const tasks = await job_schema.find({ "_id": id })
            // console.log(req.params.srNo)

        if (tasks) {
            tasks.status = verify
            tasks.save();
            res.send(tasks)
        } else {
            res.send("Not found")
        }


    } catch (e) {
        res.status(500).send()
    }
});






module.exports = router