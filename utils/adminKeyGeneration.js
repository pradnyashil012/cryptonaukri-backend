const crypto = require("crypto");
const keyDatabase = require("../models/admin/adminKey");

const keyGenAndStore = async () =>{
    try {
        const data = {
            key: crypto.randomBytes(6).toString("hex")
        }
        await keyDatabase.create(data);
        return data.key;
    }catch (e){
        console.log(e);
        return null;
    }
}

module.exports = keyGenAndStore;