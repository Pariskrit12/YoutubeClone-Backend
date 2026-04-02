import mongoose, { Schema } from "mongoose";

const videoSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    video: {
      type: String,
      required: true,
    },
    videoPublicId: {
      type: String,
    },

    thumbnail: {
      type: String,
      default: "",
    },
    thumbnailPublicId: {
      type: String,
    },

    channel: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },

    views: {
      type: Number,
      default: 0,
    },

    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    dislikes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["pending", "processing", "published", "corrupted"],
      default: "pending",
    },

    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],

    tags: [
      {
        type: String,
        trim: true,
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
    moderatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reportedBy: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        username: { type: String },
        reason: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    moderationNotes: {
      type: String,
      default: "",
    },
    reportedReason: {
      type: String,
      default: "",
    },

    // duration: {
    //   type: Number,
    //   default: 0,
    // },
  },
  { timestamps: true },
);
videoSchema.index({ title: "text", description: "text" });
videoSchema.index({ tags: 1 });

export const Video = mongoose.model("Video", videoSchema);
