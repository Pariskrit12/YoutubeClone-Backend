import { Comment } from "../models/Comment.js";
import { User } from "../models/User.js";
import { Video } from "../models/Video.js";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler.js";

//Get all Reported comments
const getReportedComments = asyncHandler(async (req, res) => {
  const reportedComments = await Comment.find({ isReported: true })
    .populate("authorId", "username")
    .populate("videoId", "title")
    .populate("moderatedBy", "username")
    .populate("reportedBy", "username")
    .sort({ createdAt: -1 });

  if (!reportedComments) {
    throw new ApiError(400, "Comments not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        reportedComments,
        "Reported comments fetched successfully"
      )
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
  const video = await Video.find({ isReported: true })
    .populate("channel", "channelName")
    .populate("reportedBy", "username")
    .populate("moderatedBy", "username")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Reported video fetched successfully"));
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

const getAllUsers=asyncHandler(async(req,res)=>{
  const users=await User.find()
  if(!users ||users.length===0){
    throw new ApiError(400,"Users not found")
  }
  return res.status(200).json(
     new ApiResponse(200,users,"Users fetched successfully")
  )
})
