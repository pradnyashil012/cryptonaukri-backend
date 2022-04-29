const Redis = require("ioredis");
const redisClient = new Redis(process.env.REDIS);


exports.userEmailForNewsLetter = async (req,res)=>{
    try{
        const emailOfUser = req.query.userEmail;
        redisClient.sismember("newsLetterUsers",emailOfUser)
            .then(async (data)=>{
                if(Number(data)===0){
                    await redisClient.sadd("newsLetterUsers",emailOfUser);
                }
              return res.status(201).json({
                  code : "ADDED",
                  emailAdded : true ,
                  message : "Your Email has been added to database"
              });
            })
            .catch(error =>{
                console.log(error);
            });
    }catch (e) {
        console.log(e);
        return res.status(400).json({
            code : "ERROR",
            emailAdded : false ,
            message : "an error occurred while adding your email to database"
        });
    }
}

exports.sendUserNewsLetter = async (req,res)=>{
    try{
        redisClient.smembers("newsLetterUsers")
            .then(async (data)=>{
                console.log(data);
                return res.status(200).json({
                    code : "NEWS_LETTERS_SENT",
                    emailsSent : true ,
                    message : "news letters where sent to the emails"
                });
            })
            .catch(e=>{
                console.log(e)
            });
    }catch (e) {
        console.log(e);
        return res.status(200).json({
            code : "NEWS_LETTERS_NOT_SENT",
            emailsSent : false ,
            message : "news letters where not sent to the emails"
        });
    }
}


