import express from "express";
import upload from "../../config/multer";
import { authHandler } from "../../middlewares/authHandler";
import { 
    createHabitController,
    getHabitsController,
    getHabitByIdController,
    deleteHabitController,
    updateHabitController,
    getListOfHabitsController,
    addHabitLogController,
    getHabitsByDateController,
    updateHabitLogProgressController,
    getDiscoverHabitsController,
    updateSkippedFailedStatusController,
    generateHabitReportController,
    getRecommendedHabitsController,
    getHabitsWithPopularityController
 } from "./habit.controller";

const router = express.Router();

router.post("/", authHandler, upload.array("images", 3), createHabitController);
router.get("/", authHandler, getHabitsController);
router.get("/home", authHandler, getHabitsByDateController);
router.get("/discover", authHandler, getDiscoverHabitsController);
router.get("/report", authHandler, generateHabitReportController);
router.get("/recommendations", authHandler, getRecommendedHabitsController);
router.get("/popularity", authHandler, getHabitsWithPopularityController);
router.get("/:habitId", authHandler, getHabitByIdController);
router.delete("/:habitId", authHandler, deleteHabitController);
router.put("/:habitId", authHandler, upload.array("images", 3), updateHabitController);
router.get("/list/all", authHandler, getListOfHabitsController);
router.get("/log/add", authHandler, addHabitLogController);
router.put("/log/progress/:habitId", authHandler, updateHabitLogProgressController);
router.put("/log/status/:habitId", authHandler, updateSkippedFailedStatusController);

export default router;
