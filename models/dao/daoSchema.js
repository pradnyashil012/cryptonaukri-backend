const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  daoName: {
    type: String,
    require: true,
  },
  websiteLink: {
    type: String,
  },
  representativeName: {
    type: String,
    require: true,
  },
  officialEmail: {
    type: String,
    unique: true,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  phoneNumber: {
    type: String,
  },
  ROLE: {
    type: String,
    default: "DAO",
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  accountDisableDate: {
    type: Date,
    default: Date.now() + 28 * 24 * 60 * 60 * 1000,
  },
});

Schema.methods.toJSON = function () {
  var obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("dao", Schema);
