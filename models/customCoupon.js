const mongoose  = require("mongoose");

const Schema = new mongoose.Schema({
   finalCoupon : {
     type:String,
     required : true,
     unique : true
   },
   couponName : {
      type : String ,
      required : true,
   },
   numberOfDays: {
      type : Number ,
      required : true
   },
   isBeingUsed : {
      type : Boolean ,
      default : false
   }
});

module.exports = mongoose.model("customCoupons",Schema);
