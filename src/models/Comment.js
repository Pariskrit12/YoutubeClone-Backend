import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true,
  },

  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  video: {
    type: Schema.Types.ObjectId,
    ref: "Video",
    required: true,
  },

  replies: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    }
  ],

  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    }
  ]
}, { timestamps: true });

export const Comment = mongoose.model("Comment", commentSchema);
