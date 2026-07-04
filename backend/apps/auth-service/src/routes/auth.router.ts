import express from "express";
import { Router } from "express";
import { forgotPassword, getUser, loginUser, refreshToken, registerUser, resetPassword, verifyForgotPasswordOtp, verifyUser } from "../controller/auth.controller.js";
import authMiddleware from "../../../../packages/middleware/authMiddleware.js"

const router = Router()
router.post("/register", registerUser);
router.post("/verify", verifyUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshToken);
router.get("/me", authMiddleware, getUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-forgot-password-otp", verifyForgotPasswordOtp);

export default router;