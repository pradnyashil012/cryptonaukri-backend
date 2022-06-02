const mongoose  = require("mongoose");

const Schema = new mongoose.Schema({
   finalCoupon : {
     type:String,
     required : true,
     unique : true
   },
   createBy:{
     type : mongoose.Schema.Types.Object ,
      ref : "admin"
   },
   couponName : {
      type : String ,
      required : true,
   },
   numberOfDays: {
      type : Number ,
      required : true
   },
    numberOfUsers : {
      type : Number ,
      required : true
    },
   usersAssociated : [{
       type : String
   }]
});

module.exports = mongoose.model("customCoupons",Schema);
