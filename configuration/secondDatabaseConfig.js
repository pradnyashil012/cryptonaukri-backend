const mongoose = require("mongoose");

const connect = async () =>{
    await mongoose.createConnection(process.env.DATABASE2);
}

module.exports = connect;