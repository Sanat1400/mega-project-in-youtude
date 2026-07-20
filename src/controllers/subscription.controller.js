import mongoose,{isValidObjectId} from "mongoose";
import { asyncHandle } from "../utils/asyncHandler.js";

import { ApiError } from "../utils/APiError.js";
import {User} from "../models/user.model.js"
import { subscription, subscription} from "../models/subscription.models.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleSubscription = asyncHandle(async(req,res)=>{
    const {channelId} = req.params

    if(!isValidObjectId(channelId)){
          throw new Error(400,"invalid channelId")
    }
    if(channelId === req.user._id.toString()){
        throw new ApiError(400,"you can not subscribe to your channal")
    }

    const channel = await User.findById(channelId);

    if(!channel){
        throw new ApiError(404,"Channel is not found")
    }

    const exitingSubscription = await subscription.findOne({
         subscriber:req.user._id,
          channel:channelId

    })

    if(exitingSubscription){
        await subscription.findByIdAndDelete(exitingSubscription._id)
        return res.status(200).json(new ApiResponse(200,{isSubscibed:false},"unsubcribed from channel Suucessfully"))
    }
    else{
        const  subscription =  await  subscription.create({
            subscriber:req.user._id,
          channel:channelId
        })
         return res.status(200).json(new ApiResponse(200,{isSubscibed:true},"subcribed from channel Suucessfully"))
    }

     
})

const getUserChannelSubscribers = asyncHandle(async(req,res)=>{
    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
          throw new Error(400,"invalid channelId")
    }
      const channel = await User.findById(channelId);
       if(!channel){
        throw new ApiError(404,"Channel is not found")
    }


    const subscribers = await subscription.aggregatre([
        {
            $match:{
                channel : new mongoose.Types.ObjectId(channelId);
            }
        },
        {
            $lookup:{
                from : "users",
                localField:"subscriber",
                foreignFeild:"_id",
                as:"subscriber",
                pipeline:[
                    {
                        #project:{
                            username:1,
                            fullname:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $addField:{
                subscriber:{
                    $first:"$subscriber"
                }

            }
        },
        {
            $project:{
                subscriber:1,
                subscribedAt:"$createdAt"
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200,subscribers,"subsciber is fectch sucessfulyy"))


})







const getSubscribedChannels = asyncHandle(async(req,res)=>{
    const {subcriberId} = req.params
    if(!isValidObjectId(subcriberId)){
          throw new Error(400,"invalid channelId")
    }
      const channel = await User.findById(subcriberId);
       if(!channel){
        throw new ApiError(404,"Channel is not found")
    }


    const subscribedchannels = await subscription.aggregatre([
        {
            $match:{
                subscriber : new mongoose.Types.ObjectId(channelId);
            }
        },
        {
            $lookup:{
                from : "users",
                localField:"channel",
                foreignFeild:"_id",
                as:"channel",
                pipeline:[
                    {
                        #project:{
                            username:1,
                            fullname:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $addField:{
                channel:{
                    $first:"$channel"
                }

            }
        },
        {
            $project:{
                channel:1,
                subscribedAt:"$createdAt"
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, subscribedchannels,"subsciberchannel is fectch sucessfulyy"))



})
export{
    toggleSubscription,getSubscribedChannels,getUserChannelSubscribers
}