const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const router = new express.Router()
const cors = require('cors')
const admin_schema = require('../../../models/admin/schema/admin_schema')
const user_schema = require('../../../models/user/schema/user_schema')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const smtpTransport = require('nodemailer/lib/smtp-transport')
var officialotp;




function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


router.use(cors())

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json());



var transporter = nodemailer.createTransport(new smtpTransport({
    //  host: "mail.naayabexclusives.com",
    // port: 587,
    //path: path,
    secure: false,
    service: 'gmail',
    auth: {

        user: "anshtester69@gmail.com",
        pass: "Test123@"

        // user: "support@naayabexclusives.com",
        // pass: "Naayab&2020"

    },
    tls: {
        rejectUnauthorized: false

    }

}));



router.post("/user/authentication/signup", async(req, res) => {

    console.log(req.body);

    user_schema.findOne({ email: req.body.email }, async function(err, data_user) {
        if (data_user) {
            res.send("Already registered");
        } else {

            try {

                officialotp = getRandomInt(100000, 999999)
                console.log(officialotp)


                const { firstname, lastname, email, phonenumber, password, location } = req.body;
                const user = new user_schema({
                    firstname,
                    lastname,
                    email,
                    phonenumber,
                    password,
                    location,
                    isVerified: false,
                    otp: officialotp
                })

                const salt = await bcrypt.genSalt(10)
                const hashPassword = await bcrypt.hash(user.password, salt)
                user.password = hashPassword

                const newUser = await user.save()

                // send verification mail to user

                var mailOptions = {
                    from: ' "Verify your mail" <anshtester69@gmail.com>',
                    to: user.email,
                    subject: 'Email verification for Cryptonaukri.com',
                    html: `<h2> ${user.firstname}! Thanks for registering </h2>
                           <h4> Please verify your mail to continue...</h4>
                           <h4>${officialotp}</h4>`

                }

                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        console.log(error)

                    } else {
                        console.log('Verification email is sent to your gmail')


                    }
                })




                res.send(newUser)

            } catch (err) {
                res.send('Error')

            }



        }

    })
});





router.post("/admin/signup", async(req, res) => {

    console.log(req.body);

    admin_schema.findOne({ email: req.body.email }, async function(err, data_user) {
        if (data_user) {
            res.send("Already registered");
        } else {

            try {

                officialotp = getRandomInt(100000, 999999)
                console.log(officialotp)


                const { name, email, password } = req.body;
                const user = new admin_schema({
                    name,
                    email,
                    password,
                    isVerified: false,
                    otp: officialotp
                })

                const salt = await bcrypt.genSalt(10)
                const hashPassword = await bcrypt.hash(user.password, salt)
                user.password = hashPassword

                const newUser = await user.save()

                // send verification mail to user

                var mailOptions = {
                    from: ' "Verify your mail" <anshtester69@gmail.com>',
                    to: user.email,
                    subject: 'Email verification for Cryptonaukri.com',
                    html: `<h2> ${user.name}! Thanks for registering </h2>
                           <h4> Please verify your mail to continue...</h4>
                           <h4>${officialotp}</h4>`

                }

                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        console.log(error)

                    } else {
                        console.log('Verification email is sent to your gmail')


                    }
                })




                res.send(newUser)

            } catch (err) {
                res.send('Error')

            }



        }

    })
});



router.post('/user/authentication/verify-email', async(req, res) => {
    try {
        console.log(req.body)
        const token = req.body.otp
        const email = req.body.email
        console.log(token)
        const user = await user_schema.findOne({ otp: token, email: email })

        if (user) {
            user.otp = null
            user.isVerified = true
            await user.save()
            console.log('Successfully Login')
            res.send(user)
        } else {
            console.log('Email not verified')
            res.send("Invalid OTP")
        }

    } catch (err) {
        console.log(err)
    }
})





router.post('/user/authentication/login', async(req, res) => {



    const { email, password } = req.body;
    const findUser = await user_schema.findOne({ email: email })
    const findAdmin = await admin_schema.findOne({ email: email })

    if (findUser) {
        const match = await bcrypt.compare(password, findUser.password)

        if (match) {
            res.send("Success");

        } else {
            console.log("Wrong Password")
            res.send('Wrong Password')

        }



    } else if (findAdmin) {
        const match = await bcrypt.compare(password, findAdmin.password)

        if (match) {
            res.send("Success");

        } else {
            console.log("Wrong Password For Admin")
            res.send('Wrong Password For Admin')

        }
    } else {
        console.log("Email not registered")
        res.send('Not registered!')
    }


});



router.post('/user/authentication/forgotpassword', async(req, res) => {

    const { email } = req.body;
    const findUser = await user_schema.findOne({ email: email })

    if (findUser) {

        res.send(findUser);

    } else {
        console.log("Email not registered")
        res.send('Not registered!')


    }

});



router.post('/user/authentication/changepassword', async(req, res) => {

    const { email, password } = req.body;
    const findUser = await user_schema.findOne({ email: email })

    if (findUser) {

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)
        findUser.password = hashPassword
        await findUser.save()

        res.send(findUser);


    } else {
        console.log("Email not registered")
        res.send('Not registered!')


    }

});


module.exports = router