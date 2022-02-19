const express = require("express")
const router = new express.Router()

const cors = require("cors")
const mongoose = require('mongoose')
const { assert } = require("console")

const job_schema = require('../../../models/business/jobs-internships/job_schema')

router.use(express.urlencoded({ extended: true }))
router.use(express.json())
router.use(cors())



// To post jobs 

router.post("/business/jobs/post-job", async(req, res) => {

    // console.log('Connected!');


    const user = new job_schema(req.body)

    try {
        await user.save()
        res.status(201).send(user)
    } catch (e) {
        res.status(400).send(e)
    }



})





router.get('/business/jobs/mypostedjobs/:id', async(req, res) => {

    const id = req.params.id.toString();


    const user = await job_schema.find({ "user_id": id })

    if (!user) {
        res.send()
    }

    return res.send(user)
})

// To delete jobs ( for admin only )

router.delete('/business/jobs/delete-job/:id', async(req, res) => {
    const id = req.params.id.toString();


    try {
        const user = await job_schema.findByIdAndDelete(id)

        if (!user) {
            return res.status(404).send()
        }

        res.send({ user, status: "JobCard deleted !", code: true })
    } catch (e) {
        res.status(500).send({ status: "couldn't delete jobCard", code: false })
    }
})


// For updating jobs

router.patch('/business/jobs/update-job/:id', async(req, res) => {

    const id = req.params.id.toString();
    console.group(id)

    console.log(req.body);


    job_schema.findByIdAndUpdate(id, {
            title: req.body.title,
            locationtype: req.body.locationtype,
            contract: req.body.contract,
            location: req.body.location,
            openings: req.body.openings,
            experince: req.body.experince,
            description: req.body.description,
            ctc: req.body.ctc,
            fixedpay: req.body.fixedpay,
            variablepay: req.body.variablepay,
            incentives: req.body.incentives,
            probationperiod: req.body.probationperiod,
            probationduration: req.body.probationduration,
            probationsalary: req.body.probationsalary,
            perks: req.body.perks,
            fivedaysweek: req.body.fivedaysweek,
            transportation: req.body.transportation,

            informaldress: req.body.informaldress,
            healthinsurance: req.body.healthinsurance,
            snacks: req.body.snacks,
            skills: req.body.skills,
            candidatepreferences: req.body.candidatepreferences,
            whyhire: req.body.whyhire,
            question: req.body.question,

            status: req.body.status,

        },


        function(err, docs) {
            if (err) {
                console.log(err)
            } else {
                console.log("Updated User : ", docs);
                res.send(docs);
            }
        });


})




module.exports = router