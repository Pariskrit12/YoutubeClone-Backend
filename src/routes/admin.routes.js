import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/isAdmin.milddleware.js";
import { getAllUsers } from "../controllers/admin.controller.js";

const router = Router();

router.route("/get-all-users").get(verifyJwt, isAdmin, getAllUsers);
export default router;
