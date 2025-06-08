import { Worker } from "bullmq";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/Video.js";
import { Channel } from "../models/channel.js";
import { videoDLQ } from "../queues/videoDLQ.js";
import { redisOptions } from "../config/redis.js";
import { sendNotification } from "../utils/notifyUser.js";

//What it is doing?
//Handles video and thumbnail upload
//Trigger failure if title contains "fail"
//saves the data into the db and add its to the channel
//on final failure after 2 attempts,moves the job to the DLQ worker(videoDLQ)

const videoWorker = new Worker(
  "videoProcessing",
  async (job) => {
    let video = null;
    try {
      const {
        userId,
        channelId,
        videoLocalPath,
        thumbnailPath,
        title,
        description,
        tags,
      } = job.data;

      if (title.toLowerCase().includes("fail")) {
        console.log("Triggered failure");
        throw new Error(
          `Video processing failed due to forbidden word in title: "${title}"`
        );
      }
      const videoUpload = await uploadOnCloudinary(videoLocalPath);
      const thumbnailUpload = await uploadOnCloudinary(thumbnailPath);

      video = await Video.create({
        channel: channelId,
        title,
        description,
        video: videoUpload?.url || "",
        videoPublicId: videoUpload?.public_id,
        thumbnail: thumbnailUpload?.url || "",
        thumbnailPublicId: thumbnailUpload?.public_id,
        tags,
      });
      
      const channel = await Channel.findById(channelId);
      if (!channel) {
        throw new ApiError(400, "Channel not found");
      }
      if (video) {
        video.status = "published";
        await video.save();
      }
      channel.videos.push(video._id);
      await channel.save();

      //:TODO add nodemailer for send notification on the mail
      await sendNotification({
        userId,
        subject: "Video uploaded successfully",
        message: `Your video title ${title} is uploaded successfully`,
      });
    } catch (error) {
      if (video && video._id) {
        job.data.videoId = video._id.toString();
      }
      console.log("Video Processing failed", error.message);
      throw error;
    }
    return { videoId: video._id.toString() };
  },
  { connection: redisOptions } // Redis connection options for BullMQ
);
videoWorker.on("failed", async (job, err) => {
  if (job.attemptsMade >= 2) {
    // If the job has already been retried 2 or more times ,job.attemptsMade is a built-in BullMQ property
    console.log("Job permanently failed moving to DLQ");

    await videoDLQ.add("failed", {
      ...job.data,
      error: err.message,
      originalJobId: job.id,
      failedAt: new Date(),
    });
  } else {
    // Warn about this failed attempt, but job will be retried again
    console.warn(`⚠️ Retry attempt ${job.attemptsMade} failed: ${err.message}`);
  }
});

export { videoWorker };
