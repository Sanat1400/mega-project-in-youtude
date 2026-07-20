import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandle } from "../utils/asyncHandler.js";

import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/APiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model";

const getAllVideo = asyncHandle(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const matchStage = {
    isPublished: true,
  };
  if (userId || isValidObjectId(userId)) {
    matchStage.owner = new mongoose.Types.ObjectId(userId);
  }

  if (query) {
    matchStage: $or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  const sortStage = {};

  if (sortBy && sortType) {
    sortStage[sortBy] = sortType === "asc" ? 1 : -1;
  } else {
    sortStage.createdAt = -1;
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: sortStage,
  };

  const videos = await Video.aggregatePaginate(
    Video.aggregate([
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $project: {
                username: 1,
                fullname: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          owner: {
            $first: "$owner",
          },
        },
      },
      {
        $sort: sortStage,
      },
    ]),
    options
  );

  return res
    .status(200)
    .json(ApiResponse(200, videos, " Videos fetched sucessfully"));
});

const publishAVideo = asyncHandle(async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    throw new ApiError(400, "Title and Description are required");
  }

  const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoFileLocalPath) {
    throw new ApiError(404, "vide url is required");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(404, "thumbail url is required");
  }

  const videofile = await uploadOnCloudinary(videoFileLocalPath);
  if (!videofile) {
    throw new ApiError(404, "video is not upload");
  }
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnail) {
    throw new ApiError(404, "thumbnail is not upload");
  }

  const duration = videofile.duration || 0;

  const video = await Video.create({
    videofile: videofile.url,
    thumbail: thumbnail.url,
    title,
    description,
    duration,
    owner: req.user._id,
  });

  const createVideo = await Video.findById(video._id).populate(
    "owner",
    "username , fullname , avatar"
  );
  return res
    .status(201)
    .json(ApiResponse(201, createVideo, " Videos upload sucessfully"));
});
const updateVideo = asyncHandle(async (req, res) => {
  const { videoId } = req.params;

  const { title, description } = req.body;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(404, "tweet id is wrrong");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  if (video.owner.toString() != req.user._id.toString()) {
    throw new ApiError(403, "you can only update your own tweets");
  }

  const updateField = {};

  if (title) updateField.title = title;
  if (description) updateField.description = description;
  if (req.file?.path) {
    const thumbail = await uploadOnCloudinary(req.file.path);
    if (!thumbail) {
      throw new ApiError(400, "Thumbnail uplaod faild");
    }
    updateFields.thumbail = thumbail;
  }
  const updateVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: updateFields,
    },
    {
      new: true,
    }
  ).populate("owner", "username fullname avatar");

  return res
    .status(201)
    .json(ApiResponse(201, updateVideo, "updsate the video"));
});

const getVideoById = asyncHandle(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(404, "video  id is wrrong");
  }

  const video = await Video.findById(videoId).populate(
    "owner",
    "username avatar fullname"
  );

  if (!video) {
    throw new ApiError(404, "video not found");
  }

  video.views += 1;
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, {
      $addToset: {
        watchHistory: videoId,
      },
    });
  }

  return res
    .status(201)
    .json(ApiResponse(201, video, " video fetched succesfully"));
});
const deletVideo = asyncHandle(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(404, "invalid id");
  }

  const video = await Video.findById(videoId);

  if (video.owner.toString() != req.user._id.toString()) {
    throw new ApiError(403, "you can only delete your own video");
  }
  await Video.findByIdAndDelete(videoId)
   return res
    .status(201)
    .json(ApiResponse(201, {}, " video deleted succesfully"));




});

const togglePublishStatus = asyncHandle(async (req, res) => {
  const { videoId } = req.params;
   if (!isValidObjectId(videoId)) {
    throw new ApiError(404, "invalid id");
  }

  const video = await Video.findById(videoId);

  if (video.owner.toString() != req.user._id.toString()) {
    throw new ApiError(403, "you can only toggle your own video");
  }

  video.isPublished = !video.isPublished
  await video.save()

  return res
    .status(201)
    .json(ApiResponse(201, video,`Video ${video.isPublished ? 'published':"unpublished sucessfully"}`));




});

export {
  getAllVideo,
  publishAVideo,
  getVideoById,
  updateVideo,
  deletVideo,
  togglePublishStatus,
};
