import express from "express";
import {
    getUserProfile,
  loginUser,
  registerUser,
  verifyOtp,
} from "../controllers/auth.controller";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

router.post("/register", registerUser);

router.post("/verify-otp", verifyOtp);

router.post("/login", loginUser);

router.get("/profile", authenticateToken, getUserProfile);

export default router;
