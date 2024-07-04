import { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Toggle subscription status for a channel
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channelId");
  }

  const toggle = await User.findById(channelId);

  return res
    .status(200)
    .json(new ApiResponse(200, toggle, "Subscription toggled successfully"));
});

// Fetch subscriber list of a channel with detailed information
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid channelId");
  }

  const subscribers = await Subscription.aggregate([
    { $match: { subscriberId: subscriberId } },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "subscriberDetails"
      }
    },
    { $unwind: "$subscriberDetails" },
    {
      $project: {
        _id: 0,
        subscriberName: "$subscriberDetails.name",
        subscriberEmail: "$subscriberDetails.email"
      }
    }
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"));
});

// Fetch channel list to which a user has subscribed along with video counts
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid userId");
  }

  const channels = await Subscription.aggregate([
    { $match: { channelId: channelId } },
    {
      $lookup: {
        from: "users",
        localField: "channelId",
        foreignField: "_id",
        as: "channelDetails"
      }
    },
    { $unwind: "$channelDetails" },
    {
      $lookup: {
        from: "videos",
        localField: "channelId",
        foreignField: "uploader",
        as: "videos"
      }
    },
    {
      $project: {
        _id: 0,
        channelName: "$channelDetails.name",
        videoCount: { $size: "$videos" }
      }
    }
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, channels, "Subscribed channels fetched successfully"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };