import { Router } from "express";
import { registerUser, loginUser, getMe } from "../controllers/user.controller.js";
import { createPost, updatePost, deletePost } from "../controllers/posts.controller.js";
import { authMiddleware } from  "../middlewares/authMiddleware.js";

const router = Router();

// Auth Routes
router.get("/me", authMiddleware, getMe);
router.post("/register", registerUser);
router.post("/login", loginUser);

// Posts Routes
router.post("/posts", authMiddleware, createPost);
router.patch("/posts/:id", authMiddleware, updatePost);
router.delete("/posts/:id", authMiddleware, deletePost);

export default router;