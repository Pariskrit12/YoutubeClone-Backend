import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import {
  clearSingleVideoHistory,
  clearWatchHistory,
  deleteVideo,
  getAllSavedVideo,
  getAllVideo,
  getLikedVideo,
  getPopularVideo,
  getRecommendedVideos,
  getSubscribedChannelVideo,
  getTrendingVideo,
  getVideoInfo,
  getWatchedHistoryVideo,
  reportVideo,
  searchVideo,
  suggestVideo,
  updateVideoInfo,
  updateVideoThumbnail,
  uploadVideo,
  watchvideo,
} from "../controllers/video.controller.js";
import { saveVideo, unsaveVideo } from "../controllers/saveVideo.controller.js";
const router = Router();
router.route("/get-all-video").get(getAllVideo);
//protected routes
router.route("/save-video/:videoId").post(verifyJwt, saveVideo);//tested
router.route('/unsave-video/:videoId').post(verifyJwt,unsaveVideo)
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
router.route("/clear-single-video-history/:videoId").delete(verifyJwt,clearSingleVideoHistory);
router.route("/get-trending-video").get(verifyJwt,getTrendingVideo);//tested'
router.route("/get-liked-video").get(verifyJwt,getLikedVideo);//tested
router.route('/get-popular-video').get(verifyJwt,getPopularVideo)//tested
router.route('/search-video').get(verifyJwt,searchVideo);//tested
router.route('/suggest-video/:videoId').get(verifyJwt,suggestVideo);
router.route('/recommendations').get(verifyJwt,getRecommendedVideos);
router.route('/report/:videoId').post(verifyJwt, reportVideo);
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
