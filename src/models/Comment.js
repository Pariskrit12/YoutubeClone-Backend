import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true,
  },

  authorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  videoId: {
    type: Schema.Types.ObjectId,
    ref: "Video",
    required: true,
  },

  replies: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default:null
    }
  ],

  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      default:[],
    }
  ],
  dislikes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      default:[],
    }
  ],

  likesComment:[
    {
      type:Schema.Types.ObjectId,
      ref:"User",
      default:[]
    }
  ],
  dislikesComment:[
    {
      type:Schema.Types.ObjectId,
      ref:"User",
      default:[]
    }
  ]
}, { timestamps: true });

export const Comment = mongoose.model("Comment", commentSchema);
