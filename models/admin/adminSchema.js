const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  firstName: {
    type: String,
    require: true,
  },
  lastName: {
    type: String,
    require: true,
  },
  officialEmail: {
    type: String,
    require: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
  phoneNumber: {
    type: String,
  },
  location: {
    type: String,
    require: true,
  },
  dateOfJoining: {
    type: Date,
    default: Date.now(),
  },
  ROLE: {
    type: String,
    default: "ADMIN",
  },
});

Schema.methods.toJSON = function () {
  var obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("admin", Schema);
