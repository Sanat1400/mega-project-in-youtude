import mongoose from "mongoose";
import {Video}  from "../models/video.model.js"
import { subscription } from "../models/subscription.models.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/APiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandle } from "../utils/asyncHandler.js";


const getChannelstats = asyncHandle(async(req,res)=>{
    const channelId =  req.user._id;
    const totalVideos =  await Video.countDocuments({
        owner:channelId
    });

    const totalSubscriber = await subscription.countDocuments({
        channel:channelId
    });

    const views = await Video.aggregate([
        {
            $match:{
                owner : channelId
            }
        },
        {
            $group:{
                _id:null,
                totalViews:{
                    $sum:"$view"
                }


            }
        }
    ]);
    const videos = await Video.find({
        owner : channelId
    }).select("-_id");

   const videoIds = videos.map(Video=>Video._id);


    const totalLikes =  await Like.countDocuments({
        Video:{
            $in:videoIds
        }
    });

    return res.status(200).json(
        new ApiResponse(200,{
            totalVideos,
            totalLikes,
            totalSubscriber,
            totalViews : views[0]?.totalViews || 0,

        },"Channel start fected sucessfully ")
    )



})
const getChannelVideo = asyncHandle(async(req,res)=>{

    const video = await Video.find({
        owner:req.user._id
    })
  return res.status(200).json(
    new ApiResponse(200,video,"video fected suceesfully")
  )

})

export {getChannelstats,getChannelVideo}