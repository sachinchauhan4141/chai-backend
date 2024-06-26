import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  // Convert page and limit to numbers
  page = parseInt(page);
  limit = parseInt(limit);

  // Construct query filter based on userId and query
  const filters = {};
  if (userId) {
    filters.userId = userId;
  }
  if (query) {
    // Example: search by title or description
    filters.$or = [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
    ];
  }

  // Construct sort options
  const sortOptions = {};
  if (sortBy) {
    sortOptions[sortBy] = sortType === 'desc' ? -1 : 1;
  } else {
    // Default sorting by createdAt, descending
    sortOptions.createdAt = -1;
  }

  // Fetch videos with pagination and sorting
  const videos = await Video.find(filters)
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(limit);

  return res.status(200).json(new ApiResponse(200, videos, "All videos fetched successfully"));
});


const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  const videoFileLocalPath = req.files?.videoFile[0]?.path;

  let thumbnailLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.thumbnail) &&
    req.files.thumbnail.length > 0
  ) {
    thumbnailLocalPath = req.files.thumbnail[0].path;
  }

  if (!videoFileLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "video file and thumbanil is required");
  }

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile) {
    throw new ApiError(400, "Error while uploading video");
  }
  if (!thumbnail) {
    throw new ApiError(400, "Error while uploading thumbnail");
  }

  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    title,
    description,
    duration: videoFile.duration,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!videoId) {
    throw new ApiError(400, "video id is required");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "video with this id doesn't exists");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  const { title, description } = req.body;

  const thumbnailLocalPath = req.file?.path;

  if (!thumbnailLocalPath || !title || !description) {
    throw new ApiError(400, "all fields are required");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!thumbnail.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
        thumbnail: thumbnail.url,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!videoId) {
    throw new ApiError(400, "video id is required");
  }

  const video = await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "video id is required");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    [
      {
        $set: { isPublished: { $eq: [false, "$isPublished"] } },
      },
    ],
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, video, "Video published status changed successfully")
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
