import mongoose, { Schema } from "mongoose";
import bcrypt from {bcrypt};
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },

    channel: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
    },

    subscription: [
      {
        type: Schema.Types.ObjectId,
        ref: "Channel",
      },
    ],

    likedVideos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],

    savedVideos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],

    avatar: {
      type: String,
      required: true,
    },

    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

userSchema.pre("save",async function (next) {
    if(!this.isModified("password")) return next();
    this.password=await bcrypt.hash(this.password,10);
    next()
})

userSchema.methods.isPasswordCorrect=async function(password){
  return await bcrypt.compare(password,this.password)
}

export const User = mongoose.model("User", userSchema);
