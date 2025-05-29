import { Router } from "express";
import { getPersonalInfo, loginUser, logoutUser, register,getUserInfo } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router=Router();

router.route("/register").post(upload.single("avatar"),register);
router.route("/login").post(loginUser);
router.route("/get-user-info/:userId").get(getUserInfo)



//Protected Routes
router.route("/logout").post(verifyJwt,logoutUser);
router.route("/get-personal-info").get(verifyJwt,getPersonalInfo);

export default router;