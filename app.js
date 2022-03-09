const express = require("express")
const app = express()
const dotenv = require("dotenv");
dotenv.config({
    path : "./configuration/config.env"
});
const cors = require("cors");
const database = require("./configuration/databaseConfig");

//Routes
const admin_business = require("./routes/admin/business/business")
const admin_internships = require("./routes/admin/internships/internships")
const admin_jobs = require("./routes/admin/jobs/jobs")
const admin_users = require("./routes/admin/users/user")

const business_authentication = require("./routes/business/authentication/authentication")
const business_jobs = require("./routes/business/jobs/jobs")
const business_interships = require("./routes/business/internships/internships")

const user_authentication = require("./routes/user/authentication/authentication")
const user_interships = require("./routes/user/internships/internships")
const user_jobs = require("./routes/user/jobs/jobs")
const user_resume = require("./routes/user/resume/resume")



app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

//using Routes
app.use(admin_business)
app.use(admin_internships)
app.use(admin_jobs)
app.use(admin_users)
app.use(business_authentication)
app.use(business_jobs)
app.use(business_interships)
app.use(user_authentication)
app.use(user_interships)
app.use(user_jobs)
app.use(user_resume)




database()
    .then(()=>console.log("Connected To Database"))
    .catch(()=>console.log("Connection To Database Failed"));


const PORT = process.env.PORT || 8000;
app.listen(PORT , ()=> console.log(`CryptoNaukri Server Started At PORT ${PORT}`));


