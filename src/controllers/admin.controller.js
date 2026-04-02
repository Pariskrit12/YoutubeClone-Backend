import { Comment } from "../models/Comment.js";
import { User } from "../models/User.js";
import { Video } from "../models/Video.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Channel } from "../models/channel.js";

//Get all Reported comments
const getReportedComments = asyncHandler(async (req, res) => {
  const reportedComments = await Comment.find({
    reportedBy: { $exists: true, $ne: [] }, // has at least one report
  })
    .populate("authorId", "username avatar") // populate comment author
    .populate("reportedBy.user", "username avatar") // populate reporter users
    .lean();

  reportedComments.forEach((c) => {
    if (!c.reportedReason && c.reportedBy.length > 0) {
      c.reportedReason = c.reportedBy[0]?.reason || "";
    }
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { comments: reportedComments },
        "Reported comments fetched successfully",
      ),
    );
});
//Comment moderatation is done here
const commentModeration = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { action, notes } = req.body;
  const adminId = req.user?._id;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(400, "Comment not found");
  }

  if (action === "approve") {
    comment.isApproved = true;
    comment.isReported = false;
  } else if (action === "reject") {
    comment.isApproved = false;
    comment.isReported = false;
  } else {
    throw new ApiError(400, "Invalid moderator action");
  }

  comment.moderatedBy = adminId;
  comment.moderationNotes = notes || "";
  await comment.save();

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment moderated successfully"));
});

//Get all Reported video
const getReportedVideo = asyncHandler(async (req, res) => {
  const videos = await Video.find({ isReported: true })
    .populate("reportedBy.user", "username")
    .populate("channel", "channelName")
    .populate("moderatedBy", "username")
    .sort({ createdAt: -1 });
  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Reported videos fetched successfully"));
});

//video moderation is done here
const videoModeration = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { notes, action } = req.body;
  const adminId = req.user?._id;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  if (action === "approved") {
    video.isApproved = true;
    video.isReported = false;
  } else if (action === "reject") {
    video.isApproved = false;
    video.isReported = false;
  } else {
    throw new ApiError(400, "Invalid moderator action");
  }

  video.moderatedBy = adminId;
  video.moderationNotes = notes || "";
  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Video moderated successfully"));
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().populate("channel");
  if (!users || users.length === 0) {
    throw new ApiError(400, "Users not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // 1️⃣ Find user
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User not found"));
  }

  // 2️⃣ Delete user's channel (if any)
  if (user.channel) {
    await Channel.findByIdAndDelete(user.channel);
  }

  // 3️⃣ Delete all videos authored by user OR linked to their channel
  await Video.deleteMany({
    $or: [{ author: userId }, { channel: user.channel }],
  });

  // 4️⃣ Delete all comments by the user
  await Comment.deleteMany({ author: userId });

  // 5️⃣ Remove user's interactions from other users
  await User.updateMany(
    { _id: { $ne: userId } },
    {
      $pull: {
        likedVideos: { $in: user.likedVideos },
        dislikedVideos: { $in: user.dislikedVideos },
        likedComments: { $in: user.likedComments },
        dislikedComments: { $in: user.dislikedComments },
        savedVideos: { $in: user.savedVideos },
        subscription: user.channel ? user.channel : null,
        watchHistory: { $in: user.watchHistory },
      },
    },
  );

  // 6️⃣ Delete the user account itself
  await User.findByIdAndDelete(userId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "User and all associated data deleted successfully",
      ),
    );
});
const deleteVideoByAdmin = asyncHandler(async (req, res) => {
  const { videoId, channelId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Optional: check if the admin wants to notify the user
  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Video deleted successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user?._id;

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  if (!user.isAdmin) throw new ApiError(403, "Only admins can delete comments");

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");

  await comment.deleteOne();

  if (comment.videoId) {
    await Video.findByIdAndUpdate(comment.videoId, {
      $pull: { comments: comment._id },
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Comment deleted successfully"));
});

export {
  getAllUsers,
  deleteUser,
  getReportedVideo,
  deleteVideoByAdmin,
  getReportedComments,
  deleteComment,
};
