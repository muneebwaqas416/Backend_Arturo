const express = require('express')
const app = express();
require('dotenv').config();
const cors = require('cors');
const cookie_parser = require('cookie-parser');
const mongoose = require('mongoose');
// const path = require('path');


const run = async () => {
  await mongoose.connect(process.env.Mongo_DB_URL)
  console.log("Connected to myDB");
}

run()
.catch((err) => console.error(err))

app.use(cors({
  origin : true,
  credentials : true
}));


const UserModel = require('./Models/UserModel');

app.use(cookie_parser());
app.use(express.json());

// const _dirname = path.dirname("");
// const buildpath = path.join(_dirname , "../Client/dist")
// app.use(express.static(buildpath))

const userRoutes = require('./Routes/UserRoutes');
const gptRouters = require('./Routes/ChatGPTroutes');
app.use('/api/user' , userRoutes);
app.use('/api/gpt' , gptRouters);

const PORT = process.env.PORT || 5000;

// if(process.env.NODE_ENV == "production"){
//     app.use(express.static("Client/dist"))
  
// }

app.listen(PORT , ()=>{
    console.log(`Server is running on port ${PORT}`);
})