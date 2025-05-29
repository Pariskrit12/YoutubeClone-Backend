import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//Generate Refresh Token and Access Token
const generateAccessTokenAndRefreshToken = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

//Register user
const register = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;

  if (!username || !name || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  //Email Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmail = emailRegex.test(email);

  if (!isValidEmail) {
    throw new ApiError(400, "Invalid email Format");
  }

  //Password Validation
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  const isValidpassword = passwordRegex.test(password);
  if (!isValidpassword) {
    throw new ApiError(
      400,
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
    );
  }

  //Checking for existing user
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    throw new ApiError(409, "User with this email or username already exist");
  }

  const avatarLocalPath = await req.file?.path; //url(localpath)

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  //upload avatar on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  //user create
  const user = await User.create({
    name,
    username: username.toLowerCase(),
    email,
    password,
    avatar: avatar.url,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering");
  }

  //returning response without sensitive field
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

//Login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "All Fields are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(401, "User does not exist");
  }

  const isValidPassword = await user.isPasswordCorrect(password);

  if (!isValidPassword) {
    throw new ApiError(401, "Password incorrect");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id);
  if (!loggedInUser) {
    throw new ApiError(500, "Something went wrong in log in");
  }

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        201,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "Log in Successfull"
      )
    );
});

//Logout user
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(201)
    .clearCookie("accessToken", options) //clearing cookie
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const getPersonalInfo=asyncHandler(async(req,res)=>{
  const userId=req.user?._id;
  

  const user=await User.findById(userId).select("-password -refreshToken").populate("channel");

  if(!user){
    throw new ApiError(400,'User not found');
  }

  return res.status(201).json(
    new ApiResponse(200,user,"User personal info fetched")
  )
})

const getUserInfo=asyncHandler(async(req,res)=>{
  const {userId}=req.params;

  const user=await User.findById(userId).select("-password -refreshToken").populate("channel");

  if(!user){
    throw new ApiError(404,"No user found")
  }

  return res.status(200).json(
    new ApiResponse(200,user,"User data fetched successfully")
  )
})
export { register, loginUser, logoutUser,getPersonalInfo,getUserInfo };
