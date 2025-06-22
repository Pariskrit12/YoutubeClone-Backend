import { Channel } from "../models/channel.js";
import { User } from "../models/User.js";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";
import { Filter } from "bad-words";

const filter = new Filter();

filter.addWords("nsfw", "porn", "sex", "xxx", "fuck");

//create channel
const createChannel = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // const user=await User.findById(userId).select("username");

  // console.log(user.username);

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(400, "User not found");
  }

  if (user.channel) {
    throw new ApiError(400, "User already has one channel");
  }

  const { channelName, description } = req.body;

  if (!channelName || !description) {
    throw new ApiError(400, "All Fields are required");
  }

  if (filter.isProfane(channelName) || filter.isProfane(description)) {
    throw new ApiError(400, "Inappropriate language is not allowed");
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
    avatarPublicId: avatar?.public_id || "",
    banner: banner?.url || "",
    bannerPublicId: banner?.public_id || "",
    owner: userId,
    ownerName: req.user?.username,
  });

  user.channel = channel._id;
  await user.save();

  if (!channel) {
    throw new ApiError(500, "Something went wrong in creating channel");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, channel, "Channel created successfully"));
});

//Delete channel
const deleteChannel = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const userId = req.user?._id;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(400, "User not found");
  }

  const channel = await Channel.findById(channelId);

  if (!channel) {
    throw new ApiError(400, "Channel not found");
  }

  if (channel.owner.toString() !== userId.toString()) {
    throw new ApiError(400, "Only owner can delete this channel");
  }

  if (channel.avatarPublicId) {
    await cloudinary.uploader.destroy(channel.avatarPublicId); //remove the file from cloudinary
  }
  if (channel.bannerPublicId) {
    await cloudinary.uploader.destroy(channel.bannerPublicId);
  }
  await Channel.findByIdAndDelete(channelId);

  user.channel = null; //remove the channel id from the userSchema
  await user.save();

  return res
    .status(201)
    .json(new ApiResponse(200, {}, "Channel Deleted Successfully"));
});

//get channel information
const getChannelInfo = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const channel = await Channel.findById(channelId);

  if (!channel) {
    throw new ApiError(400, "channel not found");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, channel, "Channel info fetched successfully"));
});

//Update channel name,description
const updateChannel = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const userId = req.user?._id;

  const updates = req.body; //only update the provided fields

  const channel = await Channel.findById(channelId);
  if (!channel) {
    throw new ApiError(400, "Channel not found");
  }

  if (!channel?.owner.equals(userId)) {
    throw new ApiError(400, "Only the owner can update the channel");
  }

  const updatedChannel = await Channel.findByIdAndUpdate(
    channelId,
    { $set: updates },
    { new: true, runValidators: true } //check for the blank space
  );

  if (!updatedChannel) {
    throw new ApiError(500, "Something went wrong");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, updatedChannel, "Successfully Updated Channel"));
});

//Update channel avatar
const updateAvatarOfChannel = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { channelId } = req.params;

  const channel = await Channel.findById(channelId);
  if (!channel) {
    throw new ApiError(400, "Channel not found");
  }
  if (!channel?.owner.equals(userId)) {
    throw new ApiError(400, "Only owner can change the avatar");
  }

  const avatarLocalPath = await req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar required");
  }

  const updatedChannel = await Channel.findByIdAndUpdate(
    channelId,
    {
      avatar: avatar.url,
      avatarPublicId: avatar.public_id,
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("avatar");

  if (!updatedChannel) {
    throw new ApiError(500, "Something went wrong");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        updatedChannel,
        "Channel avatar updated successfully"
      )
    );
});

//update channel banner
const updateBannerofChannel = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { channelId } = req.params;

  const channel = await Channel.findById(channelId);
  if (!channel) {
    throw new ApiError(400, "Channel not found");
  }

  if (!channel?.owner.equals(userId)) {
    throw new ApiError(400, "Only owner can delete the channel");
  }

  const bannerLocalPath = await req.file?.path;
  if (!bannerLocalPath) {
    throw new ApiError(400, "Banner file required");
  }

  const banner = await uploadOnCloudinary(bannerLocalPath);

  if (!banner) {
    throw new ApiError(400, "Banner file required");
  }

  const updatedChannel = await Channel.findByIdAndUpdate(
    channelId,
    {
      banner: banner.url,
      bannerPublicId: banner.public_id,
    },
    { new: true, runValidators: true }
  ).select("banner");

  if (!updatedChannel) {
    throw new ApiError(400, "Something went wrong");
  }
  return res
    .status(201)
    .json(new ApiResponse(400, updatedChannel, "Channel updated Successfully"));
});

const getChannelVideo=asyncHandler(async(req,res)=>{
  const {channelId}=req.params;

  const channel=await Channel.findById(channelId).populate("videos");
  if(!channel){
    throw new ApiError(400,"Channel not found")
  }
  return res.status(200).json(
    new ApiResponse(200,channel.videos,"Successfully fetched user channel")
  )
})

export {
  createChannel,
  deleteChannel,
  getChannelInfo,
  updateChannel,
  updateAvatarOfChannel,
  updateBannerofChannel,
  getChannelVideo
};
