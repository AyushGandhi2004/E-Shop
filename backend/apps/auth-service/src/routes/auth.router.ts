import express from "express";
import { Router } from "express";
import { createShop, createStripeConnectLink, forgotPassword, getSeller, getUser, loginSeller, loginUser, refreshToken, registerSeller, registerUser, resetPassword, verifyForgotPasswordOtp, verifySeller, verifyUser } from "../controller/auth.controller.js";
import authMiddleware from "../../../../packages/middleware/authMiddleware.js"
import {isSeller} from "../../../../packages/middleware/authorizeRoles.js"

const router = Router()
router.post("/register", registerUser);
router.post("/verify", verifyUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshToken);
router.get("/me", authMiddleware, getUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-forgot-password-otp", verifyForgotPasswordOtp);
router.post("/seller/register", registerSeller);
router.post("/seller/verify", verifySeller);
router.post("/shop/create", createShop);
router.post("/stripe/create", createStripeConnectLink);
router.post("/seller/login", loginSeller);
router.get("/seller/me", authMiddleware,isSeller, getSeller);

export default router;