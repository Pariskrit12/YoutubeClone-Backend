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

  const isLiked = video.likes.includes(userId.toString());

  res.status(200).json(
    new ApiResponse(
      200,
      {
        isLiked,
        isDisliked: false,
        likeCount: video.likes.length,
        dislikeCount: video.dislikes.length,
      },
      "Liked video successfully"
    )
  );
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
  const isDisliked = video.dislikes.includes(userId.toString());
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        video,
        isDisliked,
        isLiked: false,
        likeCount: video.likes.length,
        dislikeCount: video.dislikes.length,
      },
      "Disliked successfully"
    )
  );
});

//like comment
const likeComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const userId = req.user?._id;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(400, "User not found");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(400, "Comment not found");
  }

  const alreadyLiked = comment.likes.some(
    (id) => id.toString() == userId.toString()
  );
  const isDisliked = comment.dislikes.some(
    (id) => id.toString() == userId.toString()
  );
  if (alreadyLiked) {
    comment.likes = comment.likes.filter(
      (id) => id.toString() != userId.toString()
    );
    user.likedComments = user.likedComments.filter(
      (id) => id.toString() != commentId.toString()
    );
  } else {
    comment.likes.push(userId);
    user.likedComments.push(commentId);
  }
  if (isDisliked) {
    comment.dislikes = comment.dislikes.filter(
      (id) => id.toString() != userId.toString()
    );
    user.dislikedComments = user.dislikedComments.filter(
      (id) => id.toString() != commentId.toString()
    );
  }
  await comment.save();
  await user.save();
  const isLiked = user.likedComments.includes(commentId.toString());
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        isLiked,
        commentId,
        isDisliked: false,
        likeCount: comment.likes.length,
        dislikeCount: comment.dislikes.length,
      },
      "Liked comment successfully"
    )
  );
});

//dislike comment
const dislikeComment = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { commentId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(400, "User not found");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(400, "Comment not found");
  }

  const alreadyDisliked = comment.dislikes.some(
    (id) => id.toString() == userId.toString()
  );
  const isLiked = comment.likes.some(
    (id) => id.toString() == userId.toString()
  );
  if (alreadyDisliked) {
    comment.dislikes = comment.dislikes.filter(
      (id) => id.toString() != userId.toString()
    );
    user.dislikedComments = user.dislikedComments.filter(
      (id) => id.toString() != commentId.toString()
    );
  } else {
    comment.dislikes.push(userId);
    user.dislikedComments.push(commentId);
  }
  if (isLiked) {
    comment.likes = comment.likes.filter(
      (id) => id.toString() != userId.toString()
    );
    user.likedComments = user.likedComments.filter(
      (id) => id.toString() != commentId.toString()
    );
  }

  await comment.save();
  await user.save();
  const isDisliked = user.dislikedComments.includes(commentId.toString());
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        isDisliked,
        isLiked: false,
        likeCount: comment.likes.length,
        dislikeCount: comment.dislikes.length,
        commentId,
      },
      "Disliked comment"
    )
  );
});

export { likeVideo, dislikeVideo, likeComment, dislikeComment };
