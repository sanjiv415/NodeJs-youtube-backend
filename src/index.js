// import dotenv from "dotenv"
import 'dotenv/config'
import app from './app.js';
import dbConnect from "./db/dbConnection.js";



dbConnect()
.then(()=>{
    app.listen(process.env.PORT || 8000)
    console.log("server is running");
})
.catch((error)=> console.log(error))

