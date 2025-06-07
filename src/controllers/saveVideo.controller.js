import { User } from "../models/User.js";
import { Video } from "../models/Video.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler.js";

const saveVideo = asyncHandler(async (req, res) => {
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

  const alreadySaved = user.savedVideos.some(
    (id) => id.toString() === videoId.toString()
  );
  if (alreadySaved) {
    throw new ApiError(400, "Already saved video");
  }
  user.savedVideos.push(videoId);

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video.title, "video saved successfully"));
});

const unsaveVideo = asyncHandler(async (req, res) => {
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

  const alreadySaved = user.savedVideos.some(
    (id) => id.toString() === videoId.toString()
  );
  if (!alreadySaved) {
    throw new ApiError(400, "The video is not saved");
  }
  user.savedVideos = user.savedVideos.filter(
    (id) => id.toString() !== videoId.toString()
  );

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video.title, "Video unsaved successfully"));
});

const getSavedVideoList=asyncHandler(async(req,res)=>{
    const userId=req.user?._id;

    const user=await User.findById(userId).populate("savedVideos");
    if(!user){
        throw new ApiError(400,"User not found")
    }
    return res.status(200).json(
        new ApiResponse(200,user.savedVideos,"Fetched all saved video successfully")
    )
})
