import { Router } from "express";
import { getPersonalInfo, loginUser, logoutUser, register,getUserInfo, updateUserInfo, updateUserAvatar, changePassword } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router=Router();

router.route("/register").post(upload.single("avatar"),register)//tested;
router.route("/login").post(loginUser)//tested;
router.route("/get-user-info/:userId").get(getUserInfo)//tested



//Protected Routes
router.route("/logout").post(verifyJwt,logoutUser)//tested;
router.route("/get-personal-info").get(verifyJwt,getPersonalInfo)//tested;
router.route("/update-personal-info").put(verifyJwt,updateUserInfo)//tested;
router.route("/update-user-avatar").put(verifyJwt,upload.single("avatar"),updateUserAvatar)//tested;
router.route("/change-password").post(verifyJwt,changePassword);//tested
export default router;