import { Router } from "express";
import { registerUser, loginUser, getMe, updateUser } from "../controllers/user.controller.js";
import { getPosts, createPost, updatePost, deletePost,  } from "../controllers/posts.controller.js";
import { authMiddleware } from  "../middlewares/authMiddleware.js";

const router = Router();

// Auth Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// User Routes
router.get("/me", authMiddleware, getMe);
router.patch("/me", authMiddleware, updateUser);

// Posts Routes
router.get("/posts", authMiddleware, getPosts )
router.post("/posts", authMiddleware, createPost);
router.patch("/posts/:id", authMiddleware, updatePost);
router.delete("/posts/:id", authMiddleware, deletePost);

export default router;