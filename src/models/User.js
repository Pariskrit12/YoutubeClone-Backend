import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken"
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

    refreshToken:{
      type:String
    },

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

userSchema.pre("save",async function (next) {//hash the password before saving it into the database
    if(!this.isModified("password")) return next();//checks if the password is modified or not
    this.password=await bcrypt.hash(this.password,10);
    next()
})

userSchema.methods.isPasswordCorrect=async function(password){//compare password with the stored encrypted password
  return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken=function(){//generates access token
  return jwt.sign(
    {
      _id:this._id,
      email:this.email,
      username:this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

userSchema.methods.generateRefreshToken=function(){
  return jwt.sign(
    {
      _id:this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

export const User = mongoose.model("User", userSchema);
