const mongoose = require('mongoose');

const communityDB = mongoose.connection.useDb(process.env.SECOND_DBNAME);
const userSchema = new mongoose.Schema({
    _id : {
        type : Object ,
        require : true
    },
    firstName: {
        type: String,
        require: true,
    },
    lastName: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
        unique: true,
    },
    phoneNumber: {
        type: String,
        require: true,
    },
    location: {
        type: String,
        require: true,
    },
    isDisabled: {
        type: Boolean,
        default : false
    },
    ROLE : {
        type : String,
        default : "USER"
    }
},{_id : false});

module.exports = communityDB.model("user",userSchema);
