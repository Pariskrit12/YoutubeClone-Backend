import { Channel } from "../models/channel.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


//subscribe to channel
const subscribeToChannel=asyncHandler(async(req,res)=>{
    const userId=req.user?._id;

    const {channelId}=req.params

    const user=await User.findById(userId);

    if(!user){
        throw new ApiError(400,"User not found");
    }
    
    const channel=await Channel.findById(channelId);

    if(!channel){
        throw new ApiError(400,"Channel not found");
    }

    if(channel.owner.equals(userId)){
        throw new ApiError(400,"You cannot subscribe to your own channel");
    }

    const isAlreadySubscribed= channel.subscribers.some(subscriber=>subscriber.equals(userId));//check the userid in the channel.subscribers, it returns boolean
    if(!isAlreadySubscribed){
        channel.subscribers.push(userId);
        await channel.save();

        user.subscription.push(channelId);
        await user.save();
    }
    return res.status(200).json(
        new ApiResponse(200,{subscribedCount:channel.subscribers.length},"Subscribed successfully")
    )
})

const unsubscribeToChannel=asyncHandler(async(req,res)=>{
    const userId=req.user._id;

    const {channelId}=req.params;

    const user=await User.findById(userId);
    if(!user){
        throw new ApiError(400,"User not found")
    }

    const channel=await Channel.findById(channelId);
    if(!channel){
        throw new ApiError(400,"Channel not found");
    }

    const isSubscribed= channel.subscribers.some(subscriber=>subscriber.equals(userId));

    if(isSubscribed){
        channel.subscribers=channel.subscribers.filter(subscriber=>!subscriber.equals(userId));//return the array without the userId
        await channel.save();

        user.subscription=user.subscription.filter(subscriber=>!subscriber.equals(channelId));
        await user.save();
    }

    return res.status(200).json(
        new ApiResponse(200,{},"Unsubscribed successfully")
    )
})

const getSubscribedChannelOfLoggedInUser=asyncHandler(async(req,res)=>{
  const userId=req.user?._id;

  const user=await User.findById(userId).populate("subscription")

  if(!user){
    throw new ApiError(400,"User not found")
  }

  return res.status(200).json(
    new ApiResponse(200,user.subscription,"Fetched the subscribed channel of user")
  )
})

export {subscribeToChannel,unsubscribeToChannel,getSubscribedChannelOfLoggedInUser}