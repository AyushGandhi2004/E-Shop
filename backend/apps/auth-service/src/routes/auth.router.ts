import express from "express";
import { Router } from "express";
import { forgotPassword, loginUser, registerUser, resetPassword, verifyForgotPasswordOtp, verifyUser } from "../controller/auth.controller.js";

const router = Router()
router.post("/register", registerUser);
router.post("/verify", verifyUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-forgot-password-otp", verifyForgotPasswordOtp);

export default router;