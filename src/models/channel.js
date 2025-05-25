import mongoose, { Schema } from "mongoose";

const channelSchema=new Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        trim:true,
    },

    description:{
        type:String,
        trim:true,
    },

    avatar:{
        type:String,
        default:""
    },
    banner:{
        type:String,
        default:""
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true
    },

    subscribers:[{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
    ],

    videos:[{
        type:Schema.Types.ObjectId,
        ref:"Video"
    }],

},{timestamps:true});
export const Channel=mongoose.model("Channel",channelSchema);