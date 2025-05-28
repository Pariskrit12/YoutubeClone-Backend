import { Channel } from "../models/channel.js";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

//create channel
const createChannel = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // const user=await User.findById(userId).select("username");

  // console.log(user.username);

  const { channelName, description } = req.body;

  if (!channelName || !description) {
    throw new ApiError(400, "All Fields are required");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path; //url
  const bannerLocalPath = req.files?.banner[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file required");
  }
  if (!bannerLocalPath) {
    throw new ApiError(400, "banner file required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const banner = await uploadOnCloudinary(bannerLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file required");
  }
  if (!banner) {
    throw new ApiError(400, "banner file required");
  }

  const channel = await Channel.create({
    channelName,
    description,
    avatar: avatar?.url || "",
    banner: banner?.url || "",
    owner: userId,
    ownerName: req.user?.username,
  });

  if (!channel) {
    throw new ApiError(500, "Something went wrong in creating channel");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, channel, "Channel created successfully"));
});

//Delete channel
const deleteChannel=asyncHandler(async(req,res)=>{

    const {channelId}=req.params

    const userId=req.user?._id

    const channel=await Channel.findById(channelId);

    if(!channel){
        throw new ApiError(400,"Channel not found");
    }

    if(channel.owner.toString()!==userId.toString()){
        throw new ApiError(400,"Only owner can delete this channel")
    }

    await Channel.findByIdAndDelete(channelId);

    return res.status(201).json(
        new ApiResponse(200,{},"Channel Deleted Successfully")
    )


})

export { createChannel ,deleteChannel};
