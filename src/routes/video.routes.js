import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import { getVideoInfo, updateVideoInfo, updateVideoThumbnail, uploadVideo } from "../controllers/video.controller.js";
const router = Router();


//protected routes
router.route("/update-video-thumbnail/:videoId").put(verifyJwt,upload.single("thumbnail"),updateVideoThumbnail);
router.route("/update-video-info/:videoId").put(verifyJwt,updateVideoInfo);
router.route('/get-info-video/:videoId').get(verifyJwt,getVideoInfo);
router.route("/upload-video/:channelId").post(
  verifyJwt,
  upload.fields([
    {
      name: "videoUrl",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  uploadVideo
);

export default router;
