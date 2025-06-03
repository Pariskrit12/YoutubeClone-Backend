import { Router } from "express";

import { verifyJwt } from "../middlewares/auth.middleware.js";
import { dislikeVideo, likeVideo } from "../controllers/like.controller.js";

const router=Router();

router.route('/like-video/:videoId').post(verifyJwt,likeVideo);
router.route('/dislike-video/:videoId').post(verifyJwt,dislikeVideo);

export default router;