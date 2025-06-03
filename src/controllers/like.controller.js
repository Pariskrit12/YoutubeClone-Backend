import { User } from "../models/User.js";
import { Video } from "../models/Video.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/Comment.js";

//like video
const likeVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params; //for testing purpose
  const userId = req.user?._id;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not found");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(400, "User not found");
  }

  const alreadyLiked = video.likes.some(
    (id) => id.toString() == userId.toString()
  );
  const isDisliked = video.dislikes.some(
    (id) => id.toString() == userId.toString()
  );
  if (alreadyLiked) {
    video.likes = video.likes.filter(
      (id) => id.toString() != userId.toString()
    );
    user.likedVideos = user.likedVideos.filter(
      (id) => id.toString() != videoId.toString()
    );
  } else {
    video.likes.push(userId);
    user.likedVideos.push(videoId);
  }
  if (isDisliked) {
    video.dislikes = video.dislikes.filter(
      (id) => id.toString() != userId.toString()
    );
    user.dislikedVideos = user.dislikedVideos.filter(
      (id) => id.toString() != videoId.toString()
    );
  }
  await video.save();
  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, video.likes, "Liked video successfully"));
});

//dislike video
const dislikeVideo = asyncHandler(async (req, res) => {
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

  const alreadyDisliked = video.dislikes.some(
    (id) => id.toString() == userId.toString()
  );
  const isLiked = video.likes.some((id) => id.toString() == userId.toString());

  if (alreadyDisliked) {
    video.dislikes = video.dislikes.filter(
      (id) => id.toString() != userId.toString()
    );
    user.dislikedVideos = user.dislikedVideos.filter(
      (id) => id.toString() != videoId.toString()
    );
  } else {
    video.dislikes.push(userId);
    user.dislikedVideos.push(videoId);
  }
  if (isLiked) {
    video.likes = video.likes.filter(
      (id) => id.toString() != userId.toString()
    );
    user.likedVideos = user.likedVideos.filter(
      (id) => id.toString() != videoId.toString()
    );
  }

  await video.save();
  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Disliked successfully"));
});

//like comment
// const likeComment = asyncHandler(async (req, res) => {
//   const { commentId } = req.params;

//   const userId = req.user?._id;

//   const user = await User.findById(userId);
//   if (user) {
//     throw new ApiError(400, "User not found");
//   }

//   const comment = await Comment.findById(commentId);
//   if (!comment) {
//     throw new ApiError(400, "Comment not found");
//   }

//   const alreadyLiked=
// });

export { likeVideo, dislikeVideo };
