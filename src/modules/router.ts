import express from "express";
import authRoutes from "./auth/auth.routes"

const router = express.Router();

router.use("/v1/auth", authRoutes);

export default router;