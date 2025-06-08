import { Router } from "express";

import { verifyJwt } from "../middlewares/auth.middleware.js";
import { createChannel, deleteChannel, getChannelInfo, updateAvatarOfChannel, updateBannerofChannel, updateChannel } from "../controllers/channel.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { getSubscribedChannelOfLoggedInUser, subscribeToChannel, unsubscribeToChannel } from "../controllers/subscription.controller.js";


const router=Router();


router.route("/get-channel-info/:channelId").get(verifyJwt,getChannelInfo)//tested;

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
]),createChannel)//tested;

router.route("/delete-channel/:channelId").post(verifyJwt,deleteChannel)//tested;
router.route("/update-channel/:channelId").put(verifyJwt,updateChannel)//tested;
router.route("/update-channel-avatar/:channelId").put(verifyJwt,upload.single("avatar"),updateAvatarOfChannel)//tested;
router.route("/update-channel-banner/:channelId").put(verifyJwt,upload.single("banner"),updateBannerofChannel)//tested;
router.route('/subscribe-channel/:channelId').put(verifyJwt,subscribeToChannel);//tested
router.route('/unsubscribe-channel/:channelId').put(verifyJwt,unsubscribeToChannel)//tested;
router.route("/subscribed-channel").get(verifyJwt,getSubscribedChannelOfLoggedInUser);
export default router;