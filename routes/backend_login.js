const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const router = new express.Router()
const cors = require('cors')
const admin_schema = require('../models/admin_schema')
const user_schema = require('../models/user_schema')

router.use(cors())

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json());

// router.get('/', (req, res) => {
//     res.render('test.js')
// })

router.get('/users', async (req, res) => {
    try {
        const users = await user_schema.find({})
        res.send(users)
    } catch (e) {
        res.status(500).send()
    }
})
router.post("/signup", async (req, res) => {
    console.log(req.body);
    const user = new user_schema(req.body)
    try {
        await user.save()
        res.status(201).send(user)
    } catch (e) {
        res.status(400).send(e)
    }

})
router.post('/login', async (req, res) => {

    admin_schema.findOne({ email: req.body.email }, function (err, data_admin) {
        if (data_admin) {
            if (data_admin.password == req.body.password) {
                res.send({ "status" : `Login Success for ${data_admin.email} !!` , "admin":true, "login":true , "cUser": data_admin.email});

            } else {
                res.send({ "status": "Wrong password!", "login": false });
            }
         }
        else {
            user_schema.findOne({ email: req.body.email }, function (err, data) {
                if (data) {

                    if (data.password == req.body.password) {

                        res.send({ "status": `Success Login for ${data.email} ` , "admin":false, "login":true ,"login":true , "cUser": data.email  });

                    } else {
                        res.send({ "status": "Wrong password" });
                    }
                } else {
                    res.send({ "status": "This Email Is not regestered !" });
                }
            });
        } 
    });

});


module.exports = router