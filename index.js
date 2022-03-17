const express = require("express")
const app = express()
const dotenv = require("dotenv");
dotenv.config({
    path : "./configuration/config.env"
});
const database = require("./configuration/databaseConfig");
const cors = require("./middleware/cors");
//Routes
const userRoute = require("./routes/userRoute");
const businessRoute = require("./routes/businessRoute");
const jobRoute = require("./routes/jobRoute");

// const admin_business = require("./routes/admin/business/business")
// const admin_internships = require("./routes/admin/internships/internships")
// const admin_jobs = require("./routes/admin/jobs/jobs")
// const admin_users = require("./routes/admin/users/user")
//
// const business_jobs = require("./routes/business/jobs/jobs")
// const business_interships = require("./routes/business/internships/internships")
//
// const user_interships = require("./routes/user/internships/internships")
// const user_jobs = require("./routes/user/jobs/jobs")
// const user_resume = require("./routes/user/resume/resume")

//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors);

//using Routes
app.use("/api/v1/user",userRoute);
app.use("/api/v1/business",businessRoute);
app.use("/api/v1/jobs",jobRoute);


database()
    .then(()=>console.log("Connected To Database"))
    .catch(()=>console.log("Connection To Database Failed"));


const PORT = process.env.PORT || 8000;
app.listen(PORT , ()=> console.log(`CryptoNaukri Server Started At PORT ${PORT}`));


