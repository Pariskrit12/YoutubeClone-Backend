import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
  {
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
        default: null,
      },
    ],

    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    dislikes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],

    isReported: {
      type: Boolean,
      default: false,
    },

    isApproved: {
      type: Boolean,
      default: true,
    },
    reportedReason: {
      type: String,
      default: "",
    },
    moderatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    moderationNotes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const Comment = mongoose.model("Comment", commentSchema);
