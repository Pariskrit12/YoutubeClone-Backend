import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    }); //upload file on the cloudinary
    console.log("File uploaded successfully in cloudinary: ", response.url);
    fs.unlinkSync(localFilePath); //remove the locally saved temporary file if the operation is successfull
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //remove the locally saved temporary file if the operation got failed
    return null;
  }
};

export { uploadOnCloudinary };
