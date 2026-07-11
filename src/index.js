// require('dotenv').config({path:'./env'})
import dotenv from "dotenv";
dotenv.config({path:"./.env"});
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDb from "./db/index.js";
import {app} from './app.js'

 
connectDb()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is runing :${process.env.PORT}`)
    });
})
.catch((err)=>{
    console.log("MONOGO DB connection is failed !!!",err);
})

/*
import express from "express";
const app = express();
// try catch ->lo ya  promise 

(async()=>{
    try{
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on("error",(error)=>{
        console.log("Error",error);
        throw error
       })
       app.listen(process.env.PORT,()=>{
        console.log("App is listening on port");
       })
    }catch(error){
        console.log("Error",error);
        throw err
    }
})() */