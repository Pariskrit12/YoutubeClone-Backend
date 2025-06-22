import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { register } from "../controllers/user.controller.js";

const router=Router();

router.route('/register').post(upload.single("avatar"),register);
router.route('/upload-video/:channelId').post(upload.fields([
    {
        name:"video",
        maxCount:1
    },
    {
        name:"thumbnail",
        maxCount:1
    }
]))
export default router