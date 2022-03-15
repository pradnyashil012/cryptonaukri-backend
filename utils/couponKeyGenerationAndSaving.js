const crypto = require("crypto");
const couponDatabase = require("../models/couponModel");

const keyGenAndStoreFunc = async (email) =>{
    try{
        const couponData = {
            couponCode : crypto.randomBytes(6).toString("hex"),
            userAssociated : email
        }
        await couponDatabase.create(couponData);
        return couponData.couponCode;
    }catch (e) {
        //Need to change it.
        console.log(e);
        return null;
    }
}

module.exports = keyGenAndStoreFunc;