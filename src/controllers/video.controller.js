import { asyncHandler } from "../utils/asyncHandler.js";
import { Channel } from "../models/channel.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.js";
import { videoQueue } from "../queues/videoQueue.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/Video.js";
import { v2 as cloudinary } from "cloudinary";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
//Upload Video
const uploadVideo = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user?._id;
  const { title, description, tags } = req.body;

  if (!title || !description || !tags) {
    throw new ApiError(400, "All fields required");
  }

  const channel = await Channel.findById(channelId);
  if (!channel) {
    throw new ApiError(400, "Channel not found");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(400, "User not found");
  }

  if (!channel.owner.equals(userId)) {
    throw new ApiError(400, "You cannot upload video on this channel");
  }

  const thumbnailPath = req.files?.thumbnail[0]?.path;

  if (!thumbnailPath) {
    throw new ApiError(400, "Thumbnail File required");
  }

  const videoLocalPath = req.files?.videoUrl[0]?.path;
  if (!videoLocalPath) {
    throw new ApiError(400, "Video file required");
  }

  await videoQueue.add(
    "processVideo",
    {
      userId,
      channelId,
      title,
      description,
      tags,
      videoLocalPath,
      thumbnailPath,
    },
    { attempts: 2, backoff: 5000, removeOnComplete: true, removeOnFail: false }
  );

  res.status(202).json(new ApiResponse(200, "Video is being processed"));
});

//Get Single Video
const getVideoInfo = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const { videoId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(400, "Unauthorized access, please log in");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, video, "Information of video fetched successfully")
    );
});

//Update video title and description
const updateVideoInfo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const userId = req.user?._id;

  const updates = req.body;
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(400, "Unauthorized access, Please log in");
  }

  const video = await Video.findById(videoId).populate("channel");
  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  if (!video.channel.owner.equals(userId)) {
    throw new ApiError(400, "You cannot edit this video");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: updates,
    },
    { new: true, runValidators: true }
  );

  if (!updatedVideo) {
    throw new ApiError(500, "Something went wrong");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedVideo, "Successfully updated video info")
    );
});

const updateVideoThumbnail = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const userId = req.user?._id;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(400, "User not found");
  }

  const video = await Video.findById(videoId).populate("channel");
  if (!video) {
    throw new ApiError(400, "Video not found");
  }
  if (!video.channel.owner.equals(userId)) {
    throw new ApiError(400, "You cannot update this video thumbnail");
  }

  if (video.thumbnailPublicId) {
    await cloudinary.uploader.destroy(video.thumbnailPublicId);
  }

  const thumbnaiLocalPath = req.file?.path;

  if (!thumbnaiLocalPath) {
    throw new ApiError(400, "Thumbnail file required");
  }

  const thumbnail = await uploadOnCloudinary(thumbnaiLocalPath);
  if (!thumbnail) {
    throw new ApiError(400, "Failed to upload thumbnail");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      thumbnail: thumbnail?.url,
      thumbnailPublicId: thumbnail?.public_id,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedVideo) {
    throw new ApiError(500, "Something went wrong");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedVideo,
        "Successfully updated thumbnail of video"
      )
    );
});

export { uploadVideo, getVideoInfo, updateVideoInfo,updateVideoThumbnail };
