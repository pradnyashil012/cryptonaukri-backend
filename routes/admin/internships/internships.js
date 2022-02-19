const express = require("express")
const router = new express.Router()



const cors = require("cors")
const mongoose = require('mongoose')
const { assert } = require("console")

const internship_schema = require('../../../models/business/jobs-internships/internship_schema')

router.use(express.urlencoded({ extended: true }))
router.use(express.json())
router.use(cors())


// To check server

router.get("/basic", cors(), async(req, res) => {
    res.send("Working")
})





// to get all internships

router.get('/admin/internships/all-internships', async(req, res) => {

    // res.send('Hi');
    try {
        const tasks = await internship_schema.find({})
        res.send(tasks)
    } catch (e) {
        res.status(500).send()
    }
})

//find specific internship

router.get('/admin/internships/find/:id', async(req, res) => {


    const id = req.params.id.toString();

    const id2 = id.slice(1);

    console.log(id2);

    try {
        const tasks = await internship_schema.find({ "_id": id2 })


        res.send(tasks)
    } catch (e) {
        res.status(500).send()
    }
})


//find specific internship & update it by value passed in req

router.post('/admin/internships/change-status/:id', async(req, res) => {

    const id = req.params.id.toString();
    const { verify } = req.body.verify

    try {
        const tasks = await internship_schema.find({ "_id": id })
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
})










module.exports = router