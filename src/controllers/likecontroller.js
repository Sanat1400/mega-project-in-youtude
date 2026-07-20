

import mongoose,{isValidObjectId} from "mongoose";
import { asyncHandle } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/APiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";

const toggleVideoLike =asyncHandle(async(req,res)=>{
     const {videoId} = req.params
     if(!videoId){
      throw new ApiError(404,"videoId is is not present")
     }
     if(!isValidObjectId(videoId)){
      throw new ApiError(400,"Invalid  videoId")
     }

     const like =  await Like.findOne({
      video:videoId,
     likedBy: req.user._id
     })

     if(like){
       await Like.findByIdAndDelete(like._id)
     }
     else{
      await  Like.create({
         video:videoId,
         likedBy:req.user._id
      })
     }

     return res.status(200).json(new ApiResponse(200,{},"toogle the video like"))
})

const toggleCommentLike = asyncHandle(async(req,res)=>{
   const commentId = req.params
   if(!commentId){
      throw new ApiError(404,"comment Id is not present")
   }
   if(!isValidObjectId(commentId)){
       throw new ApiError(400,"Invalid  videoId")

   }
    const commentLike =  await Like.findOne({
      comment:commentId,
       likedBy: req.user._id
     })

     if(commentLike){
       await Like.findByIdAndDelete(like._id)
     }
     else{
      await  Like.create({
         comment:commentId,
         likedBy:req.user._id
      })
     }

     return res.status(200).json(new ApiResponse(200,{},"toogle the commet like"))



})


const toggleTweetLike = asyncHandle(async(req,res)=>{
    const  tweetId = req.params
   if(!tweetId){
      throw new ApiError(404,"comment Id is not present")
   }
   if(!isValidObjectId(tweetId)){
       throw new ApiError(400,"Invalid  videoId")

   }
    const tweetLike =  await Like.findOne({
      tweet:tweetId,
       likedBy: req.user._id
     })

     if(tweetLike){
       await Like.findByIdAndDelete(like._id)
     }
     else{
      await  Like.create({
          tweet:tweetId,
         likedBy:req.user._id
      })
     }

     return res.status(200).json(new ApiResponse(200,{},"toggle tweet like"))


})
  

 const getLikedVideo = asyncHandle(async(req,res)=>{
    const likevideo = Like.aggregate([
      {
         $match:{
            likedBy : req.user._id
          
         }
      },
      {
         $match:{
            video:{$ne:null}
         }
      },
      {
         $lookup:{
            from:"videos",
            localField:" video",
            foreignField:"_id",
            as:"video"

         }
      },
      {
         $unwind:"$video"
      }
    ]);


    return res.status(200).json(200,likevideo,"get liked are fected sucessfully")

    



 })


 export {
    toggleCommentLike,toggleTweetLike,toggleVideoLike,getLikedVideo
 }
