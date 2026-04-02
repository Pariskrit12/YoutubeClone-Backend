import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/isAdmin.milddleware.js";
import {
  deleteComment,
  deleteUser,
  deleteVideoByAdmin,
  getAllUsers,
  getReportedComments,
  getReportedVideo,
} from "../controllers/admin.controller.js";

const router = Router();

router.route("/get-all-users").get(verifyJwt, isAdmin, getAllUsers);
router.route("/deleteUser/:id").delete(verifyJwt, isAdmin, deleteUser);
router.route("/reported-videos").get(verifyJwt, isAdmin, getReportedVideo);
router.route("/reported-comments").get(verifyJwt, isAdmin, getReportedComments);

router.delete(
  "/delete-video/:videoId/:channelId",
  verifyJwt,
  isAdmin,
  deleteVideoByAdmin,
);
router
  .route("/delete-comment/:commentId")
  .delete(verifyJwt, isAdmin, deleteComment);
export default router;
