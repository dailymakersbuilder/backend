import express from "express";
import upload from "../../config/multer";
import { authHandler } from "../../middlewares/authHandler";
import { 
    createHabitController,
    getHabitsController,
    getHabitByIdController,
    deleteHabitController,
    updateHabitController,
 } from "./habit.controller";

const router = express.Router();

router.post("/", authHandler, upload.array("images", 3), createHabitController);
router.get("/", authHandler, getHabitsController);
router.get("/:habitId", authHandler, getHabitByIdController);
router.delete("/:habitId", authHandler, deleteHabitController);
router.put("/:habitId", authHandler, upload.array("images", 3), updateHabitController);

export default router;
