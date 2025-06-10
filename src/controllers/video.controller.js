import { asyncHandler } from "../utils/asyncHandler.js";
import { Channel } from "../models/channel.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.js";
import { videoQueue, videoQueueEvents } from "../queues/videoQueue.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/Video.js";
import { v2 as cloudinary } from "cloudinary";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { redisClient } from "../config/redis.js";
import { calculateTrendingScore } from "../utils/trendingScore.js";
import { calculatePopularScore } from "../utils/popularScore.js";
import { calculateRecentScore } from "../utils/recentScore.js";

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

  const videoLocalPath = req.files?.video[0]?.path;
  if (!videoLocalPath) {
    throw new ApiError(400, "Video file required");
  }

  const job = await videoQueue.add(
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

  try {
    const result = await job.waitUntilFinished(videoQueueEvents);
    const videoId = result.videoId;
    return res
      .status(200)
      .json(new ApiResponse(200, videoId, "Uploaded successfully"));
  } catch (error) {
    return res.status(500).json(
      new ApiResponse(500, "Video processing failed", {
        error: error.message,
      })
    );
  }
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

//update video thumbnail
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

  const thumbnailLocalPath = req.file?.path;

  if (!thumbnailLocalPath) {
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

//delete video
const deleteVideo = asyncHandler(async (req, res) => {
  const { channelId, videoId } = req.params;
  const userId = req.user?._id;

  const channel = await Channel.findById(channelId);
  if (!channel) {
    throw new ApiError(400, "Channel not found");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(400, "User not found");
  }

  if (!channel.owner.equals(userId)) {
    throw new ApiError(400, "You are not allowed to delete the video");
  }

  if (video.thumbnailPublicId) {
    await cloudinary.uploader.destroy(video.thumbnailPublicId);
  }
  if (video.videoPublicId) {
    await cloudinary.uploader.destroy(video.videoPublicId);
  }

  const deletedVideo = await Video.findByIdAndDelete(videoId);
  channel.videos = channel.videos.filter((id) => !id.equals(deletedVideo._id));
  await channel.save();

  return res
    .status(200)
    .json(new ApiResponse(200, deletedVideo, "Deleted video successfully"));
});

//watch video
const watchvideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(400, "User not found");
  }

  // Redis key to track whether this user has viewed this video recently
  const redisKey = `viewed:${userId}:${videoId}`;
  const alreadyViewed = await redisClient.get(redisKey);

  if (!alreadyViewed) {
    //save in db
    await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
    // Set Redis key to prevent re-counting view from same user within 1 hour
    await redisClient.set(redisKey, "1", "EX", 3600); //1 hr TTL(Time to live)
  }
  const alreadyWatched = user.watchHistory.some(
    (id) => id.toString() == videoId.toString()
  );

  if (alreadyWatched) {
    user.watchHistory = user.watchHistory.filter(
      (id) => id.toString() != videoId.toString()
    );
  }
  if (user.watchHistory.length > 30) {
    user.watchHistory.shift(); //remove the oldest
  }
  user.watchHistory.push(videoId);
  await user.save();

  return res.status(200).json(new ApiResponse(200, {}, "viewed"));
});

//Get trending video
const getTrendingVideo = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  const userId = req.user?._id;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(400, "User not found");
  }
  const videos = await Video.find(); //gives array of mongoose document

  const videoWithScore = videos.map((video) => {
    const score = calculateTrendingScore({
      views: video.views || 0,
      likes: video.likes?.length || 0,
      comments: video.comments?.length || 0,
      createdAt: video.createdAt,
    });
    return { ...video.toObject(), trendingScore: score };
  });

  videoWithScore.sort((a, b) => b.trendingScore - a.trendingScore);

  const paginatedTrendingVideo = videoWithScore.slice(skip, skip + limit);
  const totalPage = Math.ceil(videoWithScore.length / limit);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { paginatedTrendingVideo, totalPage, page },
        "Top 20 trending video"
      )
    );
});

//Get popular video
const getPopularVideo = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  const videos = await Video.find();

  if (!videos) {
    throw new ApiError(400, "Videos not found");
  }

  const videoPopularScore = videos.map((video) => {
    const score = calculatePopularScore({
      views: video.views || 0,
      likes: video.likes.length || 0,
      comments: video.comments.length || 0,
    });

    return { ...video.toObject(), popularScore: score };
  });
  videoPopularScore.sort((a, b) => b.popularScore - a.popularScore);

  const paginatedPopularVideo = videoPopularScore.slice(skip, skip + limit);
  const totalPage = Math.ceil(videoPopularScore.length / limit);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { paginatedPopularVideo, totalPage, page },
        "Fetched 20 popular post"
      )
    );
});

//get recent video
const getRecentVideo = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  const videos = await Video.find();

  const videoWithScore = videos.map((video) => {
    const score = calculateRecentScore(video.createdAt);
    return { ...video.toObject(), recencyScore: score };
  });

  videoWithScore.sort((a, b) => a.recencyScore - b.recencyScore); //Sort array in ascending order

  const paginatedRecentVideo = videoWithScore.slice(skip, skip + limit);
  const totalPage = Math.ceil(videoWithScore.length / limit);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { paginatedRecentVideo, totalPage, page },
        "20 recent post"
      )
    );
});

//get subscribed channel video
const getSubscribedChannelVideo = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const user = await User.findById(userId).populate({
    path: "subscription",
    populate: {
      path: "videos",
    },
  });

  if (!user) {
    throw new ApiResponse(400, "User not found");
  }
  const videos = user.subscription.flatMap((channel) => channel.videos);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        videos,
        "Fetched subscribed channel video successfully"
      )
    );
});

//get watch history of user
const getWatchedHistoryVideo = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;

  const skip = (page - 1) * 10;

  const userId = req.user?._id;

  const user = await User.findById(userId).populate("watchHistory");
  if (!user) {
    throw new ApiError(400, "User not found");
  }

  const total = user.watchHistory.length;
  const paginatedHistory = user.watchHistory.slice(skip, skip + limit);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { page, total, data: paginatedHistory },
        "Fetched user history"
      )
    );
});

//clear single video from history
const clearSingleVideoHistory = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(400, "User not found");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Video not found");
  }
  const videoInHistory = user.watchHistory.some(
    (id) => id.toString() === videoId.toString()
  );
  if (videoInHistory) {
    user.watchHistory = user.watchHistory.filter(
      (id) => id.toString() != videoId.toString()
    );
    await user.save();
  } else {
    throw new ApiError(400, "Video is not in the watch history");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, `Removed ${videoId} from user watch history`)
    );
});

//clear watch history
const clearWatchHistory = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(400, "User not found");
  }

  user.watchHistory = [];
  await user.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user.watchHistory,
        "Cleared watch history successfully"
      )
    );
});

//report video
const reportVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;
  const { reason } = req.body;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  const alreadyReported = video.reportedBy.some(
    (id) => id.toString() === userId.toString()
  );
  if (alreadyReported) {
    throw new ApiError(400, "You have already reported this video");
  }

  video.isReported = true;
  video.reportedBy.push(userId);
  video.reportedReason = reason;
  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video successfully reported"));
});

const searchVideo = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query || query.trim() === "") {
    throw new ApiError(400, "Search query required");
  }

  const searchRegex = new RegExp(query, "i");

  //  Search by title and description only (valid text fields)
  const videos = await Video.find({
    $or: [
      { title: { $regex: searchRegex } },
      { description: { $regex: searchRegex } },
    ],
  }).populate("channel", "channelName");

  // : Filter videos where the channelName also matches the query
  const filteredByChannel = videos.filter((video) =>
    video.channel?.channelName?.toLowerCase().includes(query.toLowerCase())
  );

  //  Combine both results, avoiding duplicates
  const finalVideos = [
    ...videos,
    ...filteredByChannel.filter(
      (vid) => !videos.some((v) => v._id.toString() === vid._id.toString())
    ),
  ];

  return res
    .status(200)
    .json(
      new ApiResponse(200, finalVideos, "Fetched searched video successfully")
    );
});

const getAllVideo = asyncHandler(async (req, res) => {
  const videos = await Video.find().populate("channel");
  if (!videos) {
    throw new ApiError(400, "Videos not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Successfully fetched video"));
});

const getAllSavedVideo = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const user = await User.findById(userId).populate({
    path: "savedVideos",
    populate: {
      path: "channel",
      select: "channelName avatar",
    },
  });

  if(!user){
    throw new ApiError(400,"User not found");
  }

  return res.status(200).json(
    new ApiResponse(200,user.savedVideos,"Saved video fetched successfully")
  )
});

export {
  uploadVideo,
  getVideoInfo,
  updateVideoInfo,
  updateVideoThumbnail,
  deleteVideo,
  watchvideo,
  getPopularVideo,
  getRecentVideo,
  getTrendingVideo,
  getSubscribedChannelVideo,
  getWatchedHistoryVideo,
  getAllVideo,
  getAllSavedVideo
};
