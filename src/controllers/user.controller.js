import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

export { register };
