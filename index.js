const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config({
    path : "./configuration/config.env"
});
const database = require("./configuration/databaseConfig");
// const database2 = require("./configuration/secondDatabaseConfig");
const cors = require("./middleware/cors");
//Routes Import
const userRoute = require("./routes/userRoute");
const businessRoute = require("./routes/businessRoute");
const jobRoute = require("./routes/jobRoute");
const internshipRoute = require("./routes/internshipRoute");
const adminRoute = require("./routes/adminRoute");
const newsLetterRoute = require("./routes/newsLetterRoute");

//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors);

//Routes
app.use("/api/v1/user",userRoute);
app.use("/api/v1/business",businessRoute);
app.use("/api/v1/jobs",jobRoute);
app.use("/api/v1/internship",internshipRoute);
app.use("/api/v1/admin",adminRoute);
app.use("/api/v1/newsLetter",newsLetterRoute);

database()
    .then(()=>console.log("Connected to database"))
    .catch(()=>console.log("Connection To Database Failed"));

// database2()
//     .then(()=>console.log("Connected To Second Database"))
//     .catch(()=>console.log("Connection To Second Database Failed"));


const PORT = process.env.PORT || 8000;
app.listen(PORT , ()=> console.log(`CryptoNaukri Server Started At PORT ${PORT}`));


async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

