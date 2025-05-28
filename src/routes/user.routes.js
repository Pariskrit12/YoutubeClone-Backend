import { Router } from "express";
import { loginUser, logoutUser, register } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router=Router();

router.route("/register").post(upload.single("avatar"),register);
router.route("/login").post(loginUser);


//Protected Routes
router.route("/logout").post(verifyJwt,logoutUser);

export default router;