import express from "express";
import { authHandler } from "../../middlewares/authHandler";
import { getColorsController, uploadIconsController, getIconsController } from "./service";

const router = express.Router();

router.get("/colors", authHandler, getColorsController);
router.get("/icons/upload", authHandler, uploadIconsController);
router.get("/icons", authHandler, getIconsController);
export default router;