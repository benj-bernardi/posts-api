import { Router } from "express";
import { getAllUsers, deleteUserByID, DeletePostById } from "../controllers/admin.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = Router();

// Admin Routes
router.get("/users", authMiddleware, authorizeRoles(["admin"]), getAllUsers);
router.delete("/users/:id", authMiddleware, authorizeRoles(["admin"]), deleteUserByID);
router.delete("/posts/:id", authMiddleware, authorizeRoles(["admin"]), DeletePostById);

export default router;
