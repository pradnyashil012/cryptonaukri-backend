const crypto = require("crypto");
const keyDatabase = require("../models/businessCouponModel");

const keyGenAndStore = async () =>{
    try {
        const couponData = {
            coupon: crypto.randomBytes(6).toString("hex")
        }
        await keyDatabase.create(couponData);
        return couponData.coupon;
    }catch (e){
        console.log(e);
        return null;
    }
}

module.exports = keyGenAndStore;