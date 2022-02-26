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
var officialotp, otp2;




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



router.post("/user/authentication/signup", async (req, res) => {

    console.log(req.body);

    user_schema.findOne({ email: req.body.email }, async function (err, data_user) {
        if (data_user) {
            res.send({ message: "Already registered" });
        } else {

            try {

                officialotp = getRandomInt(100000, 999999)
                console.log(officialotp)


                const { firstname, lastname, email, phonenumber, password, location } = req.body;
                const user = new user_schema({
                    firstname:req.body.fname,
                    lastname:req.body.lname,
                    email:req.body.email,
                    phonenumber:req.body.number,
                    password:req.body.password,
                    location:req.body.location,
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

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error)
                        res.send({message:'Could not send otp, try Again !!', code:false
                        })

                    } else {
                        console.log('Verification email is sent to your gmail')
                        res.send({ message: 'Check your mail for OTP !', code:false })

                    }
                })




                // res.send(newUser)

            } catch (err) {
                res.send({message:'Some error happened !!'})
            }



        }

    })
});





router.post("/admin/signup", async (req, res) => {

    console.log(req.body);

    admin_schema.findOne({ email: req.body.email }, async function (err, data_user) {
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

                transporter.sendMail(mailOptions, function (error, info) {
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



router.post('/user/authentication/verify-email', async (req, res) => {
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
            res.send({message: 'Success ! Otp verified !', code:'success'})
        } else {
            console.log('Email not verified')
            res.send({message: 'Wrong OTP !', code:'error'})
        }

    } catch (err) {
        console.log(err)
    }
})





router.post('/user/authentication/login', async (req, res) => {



    const { email, password } = req.body;
    const findUser = await user_schema.findOne({ email: email })
    const findAdmin = await admin_schema.findOne({ email: email })

    if (findUser) {
        const match = await bcrypt.compare(password, findUser.password)

        if (match) {
            res.send({message:"Login Successful"});

        } else {
            console.log("Wrong Password")
            res.send({message:"Wrong Password !"});

        }



    } else if (findAdmin) {
        const match = await bcrypt.compare(password, findAdmin.password)

        if (match) {
            res.send({message:"Login Successful"});

        } else {
            console.log("Wrong Password For Admin")
            res.send('Wrong Password For Admin')
            res.send({message:"Wrong Password !",});

        }
    } else {
        console.log("Email not registered")
        res.send('Not registered!')
    }


});



router.post('/user/authentication/forgotpassword', async (req, res) => {

    const { email } = req.body;
    const findUser = await user_schema.findOne({ email: email })

    if (findUser) {

        otp2 = getRandomInt(100000, 999999)

        var mailOptions = {
            from: ' "Verify your mail" <anshtester69@gmail.com>',
            to: email,
            subject: ' verification for Cryptonaukri.com',
            html: `<h2> ! To change password </h2>
                   <h4> Please verify your mail to continue...</h4>
                   <h4>${otp2}</h4>`

        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error)

            } else {
                console.log('Verification email is sent to your gmail')


            }
        })


        findUser.otp = otp2
        findUser.save();

        res.send(findUser);

    } else {
        console.log("Email not registered")
        res.send('Not registered!')


    }

});



router.post('/user/authentication/changepassword', async (req, res) => {

    const { email, password, otp } = req.body;
    const findUser = await user_schema.findOne({ email: email, otp: otp })

    if (findUser) {

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)
        findUser.password = hashPassword
        findUser.otp = null
        await findUser.save()

        res.send(findUser);


    } else {
        console.log("Email not registered")
        res.send('Not registered!')


    }

});


module.exports = router