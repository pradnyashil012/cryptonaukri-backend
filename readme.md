# Cryptonaukri Backend 

#### Todo List
- Make Controller Methods and separate controller methods from routes.
- Improve schema
- giving proper end point url to routes.
- remove a hell lot of redundancy.
- to use middleware for role based authentication.
- ... many more.


## End Points : 
**- /api/v1/user/signup :** To add user to database.
**- /api/v1/user/login :** To login
**- /api/v1/user/otp?email=youremail :** To get OTP at particular email address


## Responses :
#### - OTP :
- If we fail to send in OTP :
```
                res.status(400).json({
                    code : "OTP_FAILED",
                    otpSent : false,
                    message : "Failed To send OTP"
                })
```
- If we detect that email on which we are trying to get OTP already exists :
```
        res.status(400).json({
            code : "DUPLICATE",
            userAdded : false,
            message : "Email ID already exists"
        });

```
- If OTP is sent successfully
```
                res.status(200).json({
                    code : "OTP_SENT",
                    otpSent : true,
                    message : "OTP sent"
                });
```
- If OTP entered is wrong 
```
         res.status(400).json({
            code : "WRONG_OTP",
            userAdded : false,
            message : "Wrong OTP"
        });
```

#### - User Signup :
- Sign up is successful 
```
            res.status(201).json({
                code : "USER_ADDED",
                userAdded : true,
                message : "user has been added successfully"
            });
```
- Duplication of email is found : (subject to change)
```
        res.status(400).json({
            code : "DUPLICATE",
            userAdded : false,
            message : "Email ID already exists"
        });
```
### - User Login :
##### JWT Secret Key = `JWT_KEY=CRYPTONAUKRI@12345`
- Login up is successful 
```
            response Header will contain : JWT Token 
            res.status(200).json({
            userLoggedIn : true ,
            code : "LOGGED_IN" ,
            message : "User Logged In Successfully"
        });
```
- For Wrong Email / Password
```
        res.status(400).json({
            userLoggedIn : false ,
            code : "WRONG_PASSWORD",
            message : "user's entered password was wrong"
        });
```
- If user is not found :
```
        res.status(404).json({
            userLoggedIn : false ,
            code : "NOT_FOUND" ,
            message : "user with such username does not exist"
        });
```

## Schemas :
- User (Subject to change after addition of Internship and Job Posting stuff.)
```
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
    password: {
        type: String,
        require: true,
    },
    location: {
        type: String,
        require: true,
    },
    dateOfJoining : {
        type : Date,
        default : Date.now()
    },
    ROLE : {
        type : String,
        default : "USER"
    }
```

- OTP (Not required for Frontend)
```
{
    otp : {
        type : Number,
        required : true
    },
    emailAssociated : String
}
```