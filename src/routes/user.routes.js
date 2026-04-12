import { Router } from "express";
import { registerUser, loginUser, getMe, updateUser } from "../controllers/user.controller.js";
import { getPosts, createPost, updatePost, deletePost } from "../controllers/posts.controller.js";
import { createComment, deleteComment } from "../controllers/comments.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { refreshToken } from "../controllers/refresh.controller.js";

const router = Router();

// auth
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);

// user
router.get("/me", authMiddleware, getMe);
router.patch("/me", authMiddleware, updateUser);

// posts
router.get("/posts", authMiddleware, getPosts);
router.post("/posts", authMiddleware, createPost);
router.patch("/posts/:id", authMiddleware, updatePost);
router.delete("/posts/:id", authMiddleware, deletePost);

// comments
router.post("/posts/:id/comments", authMiddleware, createComment);
router.delete("/comments/:id", authMiddleware, deleteComment);

export default router;