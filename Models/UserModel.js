const mongoose = require('mongoose');
const run = async () => {
    console.log(process.env.Mongo_DB_URL)
    await mongoose.connect(process.env.Mongo_DB_URL);
    console.log("Connected to myDB in UserModel");
  }
  
run().catch((err) => console.error(err))
  
const userSchema = new mongoose.Schema({
    email : {
        type : String , 
        required : true,
        unique : true
    },
    password : {
        type : String
    },
    firstName :{
        type : String 
    },
    age : {
        type : String
    },
    chat: [
        {
          user_prompt: String,
          gpt_response: String,
        },
    ],
    
},{timestamps : true})

const User = mongoose.model("User" , userSchema);

module.exports = User;