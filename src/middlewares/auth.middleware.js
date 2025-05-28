import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const verifyJwt=asyncHandler(async(req,res,next)=>{
    try {
        const token=req.cookies?.accessToken ||req.header("Authorization")?.replace("Bearer ","");//fetch the token from the cookie or the header
    
        if(!token){
            throw new ApiError(401,"Unauthorized access");
        }
    
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);//verify the user token with the secret key
        const user=await User.findById(decodedToken?._id);
        if(!user){
            throw new ApiError("401","Invalid access token");
        }

        req.user=user;//save the user information in the req.user
        next();
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access token")
    }


})
export {verifyJwt};