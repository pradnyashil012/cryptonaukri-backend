const express = require("express")
const router = new express.Router()

const cors = require("cors")
const mongoose = require('mongoose')
const { assert } = require("console")

const job_schema = require('../models/job_schema')
const internship_schema = require('../models/internship_schema')

router.use(express.urlencoded({ extended: true }))
router.use(express.json())
router.use(cors())


// To check server

router.get("/basic", cors(), async(req, res) => {
    res.send("Working")
})


// To post jobs 

router.post("/jobs", async(req, res) => {

    // console.log('Connected!');

    const user = new job_schema(req.body)

    try {
        await user.save()
        res.status(201).send(user)
    } catch (e) {
        res.status(400).send(e)
    }

})

// To post internships 

router.post("/internships", async(req, res) => {
    console.log('Connected!');

    const user = new internship_schema(req.body)

    try {
        await user.save()
        res.status(201).send(user)
    } catch (e) {
        res.status(400).send(e)
    }


})



// To get all jobs

router.get('/jobs', async(req, res) => {

    // res.send('Hi');
    try {
        const tasks = await job_schema.find({})
        res.send(tasks)
    } catch (e) {
        res.status(500).send()
    }
})

//find specific job
router.get('/jobs/:id', async(req, res) => {

    // res.send('Hi');
    const id = req.params.id.toString();
    // console.log(id);
    const id2 = id.slice(1);

    console.log(id2);

    // res.send('Hi');
    try {
        const tasks = await job_schema.find({ "_id": id2 })
            // console.log(req.params.srNo)

        res.send(tasks)
    } catch (e) {
        res.status(500).send()
    }
})


// to get all internships

router.get('/internships', async(req, res) => {

    // res.send('Hi');
    try {
        const tasks = await internship_schema.find({})
        res.send(tasks)
    } catch (e) {
        res.status(500).send()
    }
})

//find specific internship
router.get('/internships/:id', async(req, res) => {

    // res.send('Hi');
    const id = req.params.id.toString();
    // console.log(id);
    const id2 = id.slice(1);

    console.log(id2);

    // res.send('Hi');
    try {
        const tasks = await internship_schema.find({ "_id": id2 })
            // console.log(req.params.srNo)

        res.send(tasks)
    } catch (e) {
        res.status(500).send()
    }
})

// To delete jobs ( for admin only )

router.delete('/jobs/:id', async(req, res) => {
    const id = req.params.id.toString();
    console.log(id);
    const id2 = id.slice(1);

    console.log(id2);
    try {
        const user = await job_schema.findByIdAndDelete(id2)

        if (!user) {
            return res.status(404).send()
        }

        res.send({ user, status: "JobCard deleted !", code: true })
    } catch (e) {
        res.status(500).send({ status: "couldn't delete jobCard", code: false })
    }
})


// To delete internships ( for admin only)

router.delete('/internships/:id', async(req, res) => {
    const id = req.params.id.toString();
    console.log(id);
    const id2 = id.slice(1);

    // console.log(id2);
    try {
        const user = await internship_schema.findByIdAndDelete(id2)

        if (!user) {
            return res.status(404).send()
        }

        res.send({ user, status: "JobCard deleted !!", code: true })
    } catch (e) {
        res.status(500).send({ status: "couldn't delete jobCard", code: false })
    }
})


// For updating jobs

router.patch('/jobs/:id', async(req, res) => {

    const id = req.params.id.toString();
    const id2 = id.slice(1);
    console.log("Here");
    console.log(id2);
    console.log(req.body);


    job_schema.findByIdAndUpdate(req.params.id, { position: req.body.position, company: req.body.company, experience: req.body.experience, openings: req.body.openings, link: req.body.link },
        function(err, docs) {
            if (err) {
                console.log(err)
            } else {
                console.log("Updated User : ", docs);
                res.send(docs);
            }
        });


})


// For updating internships

router.patch('/internships/:id', async(req, res) => {

    const id = req.params.id.toString();
    const id2 = id.slice(1);
    console.log("Here");
    console.log(id2);
    console.log(req.body);


    internship_schema.findByIdAndUpdate(req.params.id, { position: req.body.position, company: req.body.company, openings: req.body.openings, link: req.body.link },
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