const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const router = new express.Router()
const cors = require('cors')
const admin_schema = require('../../../models/admin/schema/admin_schema')
const business_schema = require('../../../models/business/schema/business_schema')

const bcrypt = require('bcrypt')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const path = require('path')
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


router.post("/business/authentication/signup", async(req, res) => {

    console.log(req.body);

    business_schema.findOne({ officialemail: req.body.email }, async function(err, data_user) {
        if (data_user) {
            res.send({message:"Already registered", code:false});
        } else {

            try {

                officialotp = getRandomInt(100000, 999999)
                console.log(officialotp)

                const { name, officialemail, password, companyname, description, estyear, gstin, headquarters, phonenumber, websitelink } = req.body;
                const user = new business_schema({
                    name : req.body.exec,
                    officialemail : req.body.email,
                    password : req.body.pass,
                    companyname : req.body.comp,
                    description : req.body.desc,
                    estyear : req.body.year,
                    gstin : req.body.gstin,
                    headquarters : req.body.hq,
                    phonenumber : req.body.phoneNo,
                    websitelink : req.body.website,
                    isVerified: false,
                    otp: officialotp

                })


                console.log(user)
                const salt = await bcrypt.genSalt(10)
                const hashPassword = await bcrypt.hash(user.password, salt)
                user.password = hashPassword
                console.log(hashPassword)

                const newUser = await user.save()

                // send verification mail to user

                var mailOptions = {
                    from: ' "Verify your mail" <anshtester69@gmail.com>',
                    to: `${user.officialemail}`,
                    subject: 'Email verification for Cryptonaukri.com',
                    html: `<h2> ${user.name}! Thanks for registering </h2>
                           <h4> Please verify your mail to continue...</h4>
                           <h4>${officialotp}</h4>`
                }

                transporter.sendMail(mailOptions, function(error, info) {
                    console.log(info+' this is info')
                    if (error) {
                        console.log("this is error"+error)
                        res.send({message:'Could not send otp, try Again !!', code:false
                        })
                    } else {
                        console.log('Verification email is sent to your gmail')
                        res.send({message:'Check your mail for OTP !'})


                    }
                })
                console.log('after all')
                // res.send(user);
                // res.send("Successfully Registered")

            } catch (err) {
                res.send(err)

            }



        }

    })
});

router.post('/business/authentication/verify-email', async(req, res) => {
    try {
        console.log(req.body)
        const token = req.body.otp
        const officialemail = req.body.email
        console.log(token)
        const user = await business_schema.findOne({ otp: token, officialemail: officialemail })

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


router.post('/business/authentication/login', async(req, res) => {



    const { email, password } = req.body;
    const findUser = await business_schema.findOne({ officialemail: email })

    if (findUser) {
        const match = await bcrypt.compare(password, findUser.password)

        if (match) {
            res.send({message:"Successfully Logged In!", cUser :findUser.officialemail, login:true});

        } else {
            console.log("Wrong Password")
            res.send({message:'Wrong Password', login:false})

        }


    } else {
        console.log("Email not registered")
        res.send({message:'Email not registered!', login:false})
    }


});




router.post('/business/authentication/forgotpassword', async(req, res) => {

    const { officialemail } = req.body;
    const findUser = await business_schema.findOne({ officialemail: officialemail })

    if (findUser) {


        otp2 = getRandomInt(100000, 999999)

        var mailOptions = {
            from: ' "Verify your mail" <anshtester69@gmail.com>',
            to: officialemail,
            subject: ' verification for Cryptonaukri.com',
            html: `<h2> ! To change password </h2>
                   <h4> Please verify your mail to continue...</h4>
                   <h4>${otp2}</h4>`

        }

        transporter.sendMail(mailOptions, function(error, info) {
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



router.post('/business/authentication/changepassword', async(req, res) => {

    const { officialemail, password, otp } = req.body;
    const findUser = await business_schema.findOne({ officialemail: officialemail, otp: otp })

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



// Axios.post(verify-email{email,otp})