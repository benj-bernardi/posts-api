import { Router } from "express";
import { registerUser, loginUser, getMe } from "../controllers/user.controller.js";
import { authMiddleware } from  "../middlewares/authMiddleware.js";

const router = Router();

router.get("/me", authMiddleware, getMe);
router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;