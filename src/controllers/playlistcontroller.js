import mongoose ,{isValidObjectId}from "mongoose";
import { asyncHandle } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { PlayList } from "../models/playlist.model.js";
import { ApiError } from "../utils/APiError.js";
const createPlaylist = asyncHandle(async(req,res)=>{
    const {name ,description} = req.boby
    if(!name?.trim() || !description?.trim()){
        throw  new ApiResponse(401,"name and description are required")
    }
    const createplayList = await PlayList.create({
            name,
            description,
            owner:req.user._id
        });

        return res.status(200).json(new ApiResponse(200,createPlaylist,"playList is create sucessfully"));
})

const getUserPlaylist = asyncHandle(async(req,res)=>{
    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(401,"get user id is wrrong ")
    }

    const getplaylist = PlayList.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)

            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            avatar:1
                        }
                    }
                ],
                as:"videos"
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"videos"
            }
        },
        {
            $addFields:{
                owner:{
                    $first:"$owner"
                }
            }
        }
    ]);
    return res.status(200).json(new ApiResponse(200,getplaylist,"play List fected sucessfully"))
     


})

const getplayListbyId =asyncHandle(async(req,res)=>{
    const{playlistId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"playList Id is not valid")
    }

    const playlistById = await PlayList.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"videos"

            }
        },
        {
            $addFields:{
                $first:"$owner"
            }
        }
    ]);

    return res.status(200).json(new ApiResponse(200,playlistById[0],"playFectd sucessfully "))






})
 
const  addVideoToplaylist = asyncHandle(async(req,res)=>{
    const {playlistId,videoId} = req.params

    if(!isValidObjectId(playlistId) || ! isValidObjectId(videoId)){
        throw new ApiError(401,"Invalid Ids")
    }

    const playList = await PlayList.findById(playlistId);

    if(!playList){
        throw new ApiError(401,"playListId is  wrrong")
    }

    if(playList.owner.toString()!== req.user._id.toString()){
        throw new ApiError(404,"user is unautrorised")
    }

    if(playList.videos.includes(videoId)){
        throw new ApiError(400,"video is present sucesfilly")
    }

    playList.videos.push(videoId);
    await playList.save();
    return res.status(200).json(new ApiResponse(200,playList,"video  added sucessfully"))
})
const removeVideoFromPlayList =asyncHandle(async(req,res)=>{
    const {playlistId,videoId} = req.params
    if(!isValidObjectId(playlistId)|| !isValidObjectId(videoId)){
        throw new ApiError(400,"id are in valid");
    }

    const playList = await PlayList.findById(playlistId);
    if(!playList){
        throw new ApiError(400,"playList is not found")
    }

    if(playList.owner.toString()!== req.user._id.toString()){
        throw ApiError(401,"unautorized request")

    }

    const updateplayList = PlayList.findByIdAndUpdate(
        playlistId,
        {
            $pull:{
                videos:videoId
            },
        },
         {
                new :true
         }
    );

    return res.status(200).json(ApiResponse(200,updatePlaylist,"video removed is playList"))



})
const deletePlayList = asyncHandle(async(req,res)=>{
    const {playlistId} = req.params
     if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"id are in valid");
    }

    const playList = await PlayList.findById(playlistId);
    if(!playList){
        throw new ApiError(400,"playList is not found")
    }

    if(playList.owner.toString()!== req.user._id.toString()){
        throw ApiError(401,"unautorized request")
    }

    await PlayList.findByIdAndDelete(playlistId);

      return res.status(200).json(ApiResponse(200,{},"playList removed is playList"))



})
const updatePlaylist = asyncHandle(async(req,res)=>{
    const {playlistId} = req.params
    const {name,description} = req.boby


     if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"id are in valid");
    }

    if(!name?.trim() || !description?.trim()){
        throw new ApiResponse(400,"name and description are required")
    }

    const playList = await PlayList.findById(playlistId);
    if(!playList){
        throw new ApiError(400,"playList is not found")
    }

    if(playList.owner.toString()!== req.user._id.toString()){
        throw ApiError(401,"unautorized request")
    }


    const updateplayList = PlayList.findByIdAndUpdate(
        playlistId,
        {
            $set:{
                name,
                description
            }

        },
        {
            new :true
        }
    );

    return res.status(200).json(200,updatePlaylist,"playList update sucessfully")






     
})


export {
    createPlaylist,
    getUserPlaylist,
    getplayListbyId,
    addVideoToplaylist,
    removeVideoFromPlayList,
    deletePlayList,
    updatePlaylist
}