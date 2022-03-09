# CryptoNaukri Backend 

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
- 


### User Schema : 
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
    isVerified: {
        type: Boolean,
        default : false
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