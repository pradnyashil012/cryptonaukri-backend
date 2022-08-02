const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  coupon: {
    type: String,
    unique: true,
  },
  daoAssociated: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model("daoCoupon", schema);
