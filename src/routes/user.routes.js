import { Router } from "express";
import { registerUser, loginUser, getMe } from "../controllers/user.controller.js";
import { authMiddleware } from  "../middlewares/authMiddleware.js";
import { createPost, updatePost } from "../controllers/posts.controller.js";

const router = Router();

router.get("/me", authMiddleware, getMe);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/posts", authMiddleware, createPost);
router.patch("/posts/:id", authMiddleware, updatePost);

export default router;