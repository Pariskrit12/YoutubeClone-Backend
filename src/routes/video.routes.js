import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import {
  clearWatchHistory,
  deleteVideo,
  getAllSavedVideo,
  getAllVideo,
  getLikedVideo,
  getSubscribedChannelVideo,
  getTrendingVideo,
  getVideoInfo,
  getWatchedHistoryVideo,
  updateVideoInfo,
  updateVideoThumbnail,
  uploadVideo,
  watchvideo,
} from "../controllers/video.controller.js";
import { saveVideo } from "../controllers/saveVideo.controller.js";
const router = Router();
router.route("/get-all-video").get(getAllVideo);
//protected routes
router.route("/save-video/:videoId").post(verifyJwt, saveVideo);
router.route("/get-saved-video").get(verifyJwt, getAllSavedVideo);
router.route("/get-watched-video").get(verifyJwt, getWatchedHistoryVideo); //tested;
router
  .route("/subscribed-channel-video")
  .get(verifyJwt, getSubscribedChannelVideo);
router.route("/watch-video/:videoId").post(verifyJwt, watchvideo); //tested;
router
  .route("/delete-video/:videoId/:channelId")
  .delete(verifyJwt, deleteVideo); //tested;
router
  .route("/update-video-thumbnail/:videoId")
  .put(verifyJwt, upload.single("thumbnail"), updateVideoThumbnail); //tested;
router.route("/update-video-info/:videoId").put(verifyJwt, updateVideoInfo); //tested;
router.route("/get-info-video/:videoId").get(verifyJwt, getVideoInfo); //tested;
router.route("/clear-watch-history").delete(verifyJwt,clearWatchHistory);//tested
router.route("/get-trending-video").get(verifyJwt,getTrendingVideo);//tested'
router.route("/get-liked-video").get(verifyJwt,getLikedVideo);
router.route("/upload-video/:channelId").post(
  verifyJwt,
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  uploadVideo
); //tested

export default router;
