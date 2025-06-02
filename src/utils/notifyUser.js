import { User } from "../models/User.js"
import { ApiError } from "./ApiError.js";


const sendNotification=async({userId,message,subject})=>{
    const user=await User.findById(userId);
    if(!user){
        throw new ApiError(400,"User not found while sending notification");
    }
    console.log(`${subject}-${message}`);
    
    return{
        sucess:true,
        message:"Notification sent sucessfully",
        data:{
            userId,message,subject
        }
    }

}
export {sendNotification}