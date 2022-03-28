const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
},{strict : false});

module.exports = mongoose.model("adminLogs",Schema);
