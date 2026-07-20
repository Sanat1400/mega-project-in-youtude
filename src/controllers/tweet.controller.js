import mongoose,{isValidObjectId} from "mongoose";
import { asyncHandle } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import {Tweet } from "../models/tweet.model.js"
 
import { ApiError } from "../utils/APiError";
import { ApiResponse } from "../utils/ApiResponse";


const createTweet = asyncHandle(async(req,res)=>{
     const tweetcontent = req.body;
     if(!tweetcontent){
        throw new ApiError(401,"tweet content is required")
     }

     const tweet = await Tweet.create(
        {
            content:tweetcontent.trim(),
            owner:req.user._id
        }
     ) 

     const createtweet = await Tweet.findById(tweet._id).populate("owner","username fullname avatar")

     return res.status(200).json(new ApiResponse(201,createTweet,"tweet created sucessfully"))

})


const getUserTweet = asyncHandle(async(req,res)=>{

    const {userId} = req.params;

    if(!isValidObjectId(userId)){
        throw new ApiError(404,"Invalid user Id")
    }

    const user = await User.findById(userId);
    if(!user){
        throw new ApiError(404,"User is not found")
    }


    const tweets = await Tweet.find({
        owner:userId
    })
    .populate("owner","username fullname avatar").sort({createdAt :-1})


    return res.status(200).json(ApiResponse(200,tweets,"user tweet fetch sucessfullty"))
  
    



})



const updateTweet = asyncHandle(async(req,res)=>{
    const {tweetId} = req.params;
     const {content} = req.body;
    if(!isValidObjectId(tweetId)){
        throw new ApiError(404,"tweet id is wrrong")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(404,"Tweet not found")
    }
    if(tweet.owner.toString()!=req.user._id.toString()){
        throw new ApiError(403,"you can only update your own tweets")

    }
    if(!content || content.trim()==""){
        throw new ApiError(400,"tweet cont6ent is required")

    }

    const updatetweet = await  Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{
                content:content.trim()
            }
        },
        {
            new :true
        }
    ).populate("owner","username fullname avatar")

    return res.status(200).json(ApiResponse(200,{}," Tweet  update sucessfully"))
})

const deleteTweet = asyncHandle(async(req,res)=>{
    const {tweetId} = req.params;

    if(!isValidObjectId(tweetId)){
        throw new ApiError(404,"tweet id is wrrong")
    }
    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(404,"Tweet not found")
    }

     if(tweet.owner.toString()!=req.user._id.toString()){
        throw new ApiError(403,"you can only delete your own tweets")

    }

    await Tweet.findByIdAndDelete(tweetId)
     return res.status(200).json(ApiResponse(200,{}," Tweet  delete sucessfully"))
})

export{
    createTweet,getUserTweet,updateTweet,deleteTweet
}