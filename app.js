const express = require("express")
const path = require('path')
require('dotenv').config()
    // const connectDB = require('./connection/connect')
const app = express()
const port = process.env.PORT || 3001;
const cors = require("cors")
const mongoose = require('mongoose')

const admin_business = require("./routes/admin/business/business")
const admin_internships = require("./routes/admin/internships/internships")
const admin_jobs = require("./routes/admin/jobs/jobs")

const business_authentication = require("./routes/business/authentication/authentication")
const business_jobs = require("./routes/business/jobs/jobs")
const business_interships = require("./routes/business/internships/internships")

const user_authentication = require("./routes/user/authentication/authentication")
const user_interships = require("./routes/user/internships/internships")
const user_jobs = require("./routes/user/jobs/jobs")
const user_resume = require("./routes/user/resume/resume")






app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())



app.use(admin_business)
app.use(admin_internships)
app.use(admin_jobs)
app.use(business_authentication)
app.use(business_jobs)
app.use(business_interships)
app.use(user_authentication)
app.use(user_interships)
app.use(user_jobs)
app.use(user_resume)


// if (process.env.NODE_ENV === 'production') {

//     // app.use(express.static("frontend/build"))
//     app.use(express.static(path.join(__dirname, "frontend","build")))

//     app.get('*' ,(req ,res)=>{
//         res.sendFile(path.join(__dirname ,"frontend" ,"build" ,"index.html"))
//     })
// }
// else{
//     app.get("/" ,(req ,res)=>{
//         res.send('API is running')
//     })
// }

app.get("/", (req, res) => {
    res.send("APIs are running!")
})

const start = async() => {
    try {
        await mongoose.connect("mongodb+srv://cryptoNaukri:CN2022@cryptonaukri.psxhi.mongodb.net/cryptoNaukriDb", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        app.listen(port)
    } catch (error) {
        console.log(error)
    }
}

start();



// mongoose.connect(process.env.DATABASE);

// mongoose.connection.once('open', function() {
//     console.log('Connection made !');
// }).on('error', function(error) {
//     console.log(error);
// })


// app.listen(port, () => {
//     console.log(`server running at ${port}`);
// })