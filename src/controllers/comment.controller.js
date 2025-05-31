import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/Video.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.js";
import { Comment } from "../models/Comment.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//create comment
const createComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const userId = req.user?._id;

  const { content } = req.body;

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Comment content is required");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(400, "User not found");
  }

  const comment = await Comment.create({
    content,
    authorId: userId,
    videoId: videoId,
  });

  video.comments.push(comment._id);
  await video.save();

  if (!comment) {
    throw new ApiError(500, "Something went wrong");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, comment, "Comment created successfully"));
});

//delete comment
const deleteComment = asyncHandler(async (req, res) => {
  const { videoId, commentId } = req.params;

  const userId = req.user?._id;

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(400, "User not found");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(400, "Comment not found");
  }

  if (!comment.authorId.equals(userId) && user.role !== "admin") {
    throw new ApiError(400, "You cannot delete this comment");
  }

  const deletedComment = await Comment.findByIdAndDelete(commentId);

  if (!deletedComment) {
    throw new ApiError(500, "Something went wrong");
  }

  video.comments = video.comments.filter(
    (comment) => !comment.equals(deletedComment._id)
  );
  await video.save();


  const parentComment=await Comment.findOne({replies:commentId});

  if(parentComment){
    parentComment.replies=parentComment.replies.filter(id=>!id.equals(commentId));
  }
  await parentComment.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

//get comments of the video
const getCommentOfVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId)
    .populate({
      path: "comments",
      populate: [
        { path: "authorId", select: "username" },
        {
          path: "replies",
          populate: { path: "authorId", select: "username" },
        },
      ],
    })
    .select("comments");

  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video.comments, "Comment of the video fetched"));
});

//update comments
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const userId = req.user?._id;

  const { content } = req.body;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(400, "Comment not found");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(400, "User not found");
  }

  if (!comment.authorId.equals(userId)) {
    throw new ApiError(400, "You cannot edit this comment");
  }

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content cannot be empty");
  }
  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { $set: { content } },
    { new: true, runValidators: true }
  );

  if (!updatedComment) {
    throw new ApiError(500, "Something went wrong");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

//like and dislike comments

//pagination and sorting comments

//reply to the comments
const commentReplies = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const userId = req.user?._id;

  const { content } = req.body;

  const parrentComment = await Comment.findById(commentId);

  if (!parrentComment) {
    throw new ApiError(400, "Comment not found");
  }
  const reply = await Comment.create({
    content: content,
    authorId: userId,
    videoId: parrentComment?.videoId,
  });

  parrentComment.replies.push(reply._id);
  await parrentComment.save();

  return res
    .status(201)
    .json(new ApiResponse(200, reply, "Reply added successfully"));
});

//moderation features
