import { Router } from "express";

import { verifyJwt } from "../middlewares/auth.middleware.js";
import { createChannel } from "../controllers/channel.controller.js";
import {upload} from "../middlewares/multer.middleware.js";

const router=Router();

//protected routes
router.route("/create-channel").post(verifyJwt,upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"banner",
        maxCount:1
    }
]),createChannel);
export default router;