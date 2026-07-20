import mongoose from "mongoose";
import { Comment } from "../models/comment.model";
import { ApiError } from "../utils/APiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandle } from "../utils/asyncHandler";


const getVideoComments = asyncHandle(async(req,res)=>{
    const {videoId} = req.params
    const {page = 1 ,limit=10} = req.query;
    const  aggregate = Comment.aggregate([
        {
            $match:{
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
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
            $addFields:{
                owner:{
                    $first:"$owner"
                }
            }
        }
    ])

    const comments = await Comment.aggregatePaginate(aggregate,{page,limit});

    return res.status(200).json(
        new ApiResponse(200,comments,"Comments fetched Succesfully")
    )




})

const addComment = asyncHandle(async(req,res)=>{

    const {videoId} = req.params;
    const {content} = req.body;
    if(!content){
        throw new ApiError(400,"Comment content is required")
    }
    const comment = await Comment.create({
        content,
        video:videoId,
        owner:req.user._id
    })

     return res.status(201).json(
        new ApiResponse(201,comment,"Comments fetched Succesfully")
    )


})

const updateComment = asyncHandle(async(req,res)=>{
    const {commentId } = req.params;
    const {content } = req.body;
    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {content},
        {new :true}
    )
    if(!comment){
        throw new ApiError(404,"Comment not found")
    }
     return res.status(200).json(
        new ApiResponse(200,comment,"Comments update  Succesfully")
    )


})

const deleteComment =asyncHandle(async(req,res)=>{
    const {commentId} =  req.params;
    const comment = await Comment.findByIdAndDelete(commentId)
    if(!comment){
        throw new ApiError(404,"Comment is not found")
    }
     return res.status(200).json(
        new ApiResponse(200,{},"Comments deleted Succesfully")
    )

})


export {getVideoComments,addComment,updateComment,deleteComment}