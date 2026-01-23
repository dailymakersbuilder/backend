import express from "express";
import { 
    registerController,
    loginController,
    findOrCreateFirebaseUserController,
    sendOTPController,
    verifyOTPController,
    resetPasswordController
 } from "./auth.controller";

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/firebase-auth", findOrCreateFirebaseUserController);
router.post("/send-otp", sendOTPController);
router.post("/verify-otp", verifyOTPController);
router.post("/reset-password", resetPasswordController);

export default router;