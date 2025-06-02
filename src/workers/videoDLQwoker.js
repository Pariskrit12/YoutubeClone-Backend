import { sendNotification } from "../utils/notifyUser.js";
import { Worker } from "bullmq";
import { redisOptions } from "../config/redis.js";
import { Video } from "../models/Video.js";
import { v2 as cloudinary } from "cloudinary";

const dlqWorker = new Worker(
  "videoDLQ",
  async (job) => {
    const {
      title,
      userId,
      channelId,
      videoLocalPath,
      thumbnailPath,
      description,
      tags,
      error,
      originalJobId,
      failedAt,
      videoId,
    } = job.data;

    console.log(`DLQ Worker Final failure for ${title}`);

    try {
      const video = await Video.findById(videoId);
      if (video) {
        if (video.videoPublicId) {
          await cloudinary.uploader.destroy(video.videoPublicId);
        }
        if (video.thumbnailPublicId) {
          await cloudinary.uploader.destroy(video.thumbnailPublicId);
        }

        video.status="corrupted"
        video.errorMessage = error;
        await video.save();
        console.log(` Video ${videoId} marked as corrupted`);
      }
    } catch (err) {
      console.error("Error deleting media or updating video:", err.message);
    }

    //:TODO add nodemailer for send notification on the mail
    try {
      await sendNotification({
        userId,
        message: `Your video titled "${title}" failed.`,
        subject: "Video processing failed",
      });
    } catch (notifyErr) {
      console.error("Failed to send notification:", notifyErr.message);
    }
  },
  { connection: redisOptions }
);

export { dlqWorker };
