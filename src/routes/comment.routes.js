import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  createComment,
  deleteComment,
  getCommentOfVideo,
  reportComment,
} from "../controllers/comment.controller.js";

const router = Router();
router.route("/create-comment/:videoId").post(verifyJwt, createComment); //tested
router.route("/get-comment-video/:videoId").get(verifyJwt, getCommentOfVideo); //tested
router
  .route("/delete-comment/:videoId/:commentId")
  .delete(verifyJwt, deleteComment);
router.route("/report-comment/:commentId").post(verifyJwt, reportComment);
// router.route('/moderation').post(verifyJwt,isAdmin,moderation)
export default router;
