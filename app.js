const express = require("express")
const path = require('path')
require('dotenv').config()
// const connectDB = require('./connection/connect')
const app = express()
const port = process.env.PORT || 3001;
const cors = require("cors")
const mongoose = require('mongoose')




const login = require("./routes/backend_login")
const job = require("./routes/jobs")



app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())


app.use(job)
app.use(login)
 

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

const start = async () => {
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
