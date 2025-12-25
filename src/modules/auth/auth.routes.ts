import express from "express";
import { 
    registerController,
    loginController,
    findOrCreateFirebaseUserController
 } from "./auth.controller";

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/firebase-auth", findOrCreateFirebaseUserController);

export default router;