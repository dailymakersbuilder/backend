import express from "express";
import authRoutes from "./auth/auth.routes"
import userRoutes from "./user/user.routes"
import habitRoutes from "./habits/habit.routes"

const router = express.Router();

router.use("/v1/auth", authRoutes);
router.use("/v1/user", userRoutes);
router.use("/v1/habit", habitRoutes);

export default router;