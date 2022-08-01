const crypto = require("crypto");
const keyDatabase = require("../models/dao/daoCouponModel");

const keyGenAndStore = async () => {
  try {
    const couponData = {
      coupon: crypto.randomBytes(6).toString("hex"),
    };
    await keyDatabase.create(couponData);
    return couponData.coupon;
  } catch (e) {
    console.log(e);
    return null;
  }
};

module.exports = keyGenAndStore;
