const express = require("express")
const router = new express.Router()



const cors = require("cors")
const mongoose = require('mongoose')
const { assert } = require("console")

const internship_schema = require('../../../models/business/jobs-internships/internship_schema')

router.use(express.urlencoded({ extended: true }))
router.use(express.json())
router.use(cors())




// To post internships 

router.post("/business/internships/post-internship", async(req, res) => {
    console.log('Connected!');

    const user = new internship_schema(req.body)

    try {
        await user.save()
        res.status(201).send(user)
    } catch (e) {
        res.status(400).send(e)
    }


})


router.get('/business/internships/mypostedinternships/:id', async(req, res) => {

    const id = req.params.id.toString();


    const user = await internship_schema.find({ "user_id": id })

    if (!user) {
        res.send()
    }

    return res.send(user)
})



// To delete internships ( for admin only)

router.delete('/business/internships/delete-internship/:id', async(req, res) => {
    const id = req.params.id.toString();
    console.log(id);

    try {
        const user = await internship_schema.findByIdAndDelete(id)

        if (!user) {
            return res.status(404).send()
        }

        res.send({ msg: "Successfully deleted !", status: "JobCard deleted !!", code: true })
    } catch (e) {
        res.status(500).send({ status: "couldn't delete jobCard", code: false })
    }
})



// For updating internships

router.patch('/business/internships/update-internship/:id', async(req, res) => {

    const id = req.params.id.toString();
    const id2 = id.slice(1);
    console.log("Here");
    console.log(id2);
    console.log(req.body);

    /*
     "title": "fo",
 "locationtype": "fo",
 "location": "fo",
 "openings": 1,
 "startdate": "fo",
 "duration": "fo",
 "responsibilities": "fo",
 "amounttype": "fo",
 "currencytype": "fo",
 "amount": 100,
 "certificate": "fo",
 "letterofrecommendation": "fo",
 "workhours": "fo",
 "dresscode": "fo",
 "food": "fo",
 "isPPO": "fo",
 "skills": ["pp" , "p"],
 "question1": "fo",
  "question2": "fo",
 "status": "fo"

    */


    internship_schema.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            locationtype: req.body.locationtype,
            openings: req.body.openings,
            startdate: req.body.startdate,
            duration: req.body.duration,
            responsibilities: req.body.responsibilities,
            amounttype: req.body.amounttype,
            currencytype: req.body.currencytype,

            amount: req.body.amount,
            certificate: req.body.certificate,
            letterofrecommendation: req.body.letterofrecommendation,
            workhours: req.body.workhours,
            dresscode: req.body.dresscode,
            food: req.body.food,
            isPPO: req.body.isPPO,
            skills: req.body.skills,
            question1: req.body.question1,
            oquestion2: req.body.question2,
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