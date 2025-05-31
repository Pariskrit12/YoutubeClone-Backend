import { asyncHandler } from "../utils/asyncHandler.js";
import {Channel} from "../models/channel.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.js";
import { videoQueue } from "../queues/videoQueue.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const uploadVideo=asyncHandler(async(req,res)=>{
    const {channelId}=req.params;
    const userId=req.user?._id;
    const {title,description,tags}=req.body;

    if(!title || !description || !tags){
        throw new ApiError(400,"All fields required");
    }

    const channel=await Channel.findById(channelId);
    if(!channel){
        throw new ApiError(400,'Channel not found')
    }

    const user=await User.findById(userId);
    if(!user){
        throw new ApiError(400,"User not found");
    }

    if(!channel.owner.equals(userId)){
        throw new ApiError(400,"You cannot upload video on this channel");
    }

    const thumbnailPath=req.files?.thumbnail[0]?.path;

    if(!thumbnailPath){
        throw new ApiError(400,"Thumbnail File required");
    }

    const videoLocalPath=req.files?.videoUrl[0]?.path;
    if(!videoLocalPath){
        throw new ApiError(400,"Video file required");
    }

    await videoQueue.add("processVideo",{
        userId,
        channelId,
        title,description,tags,videoLocalPath,thumbnailPath
    });

    res.status(202).json(
        new ApiResponse(200,"Video is being processed")
    )

})
