import { Router } from "express";

import { verifyJwt } from "../middlewares/auth.middleware.js";
import { dislikeComment, dislikeVideo, likeComment, likeVideo } from "../controllers/like.controller.js";

const router=Router();

router.route('/like-video/:videoId').post(verifyJwt,likeVideo);
router.route('/dislike-video/:videoId').post(verifyJwt,dislikeVideo);
router.route('/dislike-comment/:commentId').post(verifyJwt,dislikeComment);
router.route('/like-comment/:commentId').post(verifyJwt,likeComment);

export default router;