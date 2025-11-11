import User from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { sendOtp } from "../utils/mailer";

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        [key: string]: any;
      };
    }
  }
}

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Generic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 2 * 60 * 1000); // OTP valid for 2 minutes

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      confirmPassword: hashedPassword,
      otp,
      otpExpires,
    });

    await newUser.save();
    await sendOtp(email, otp);

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        isVerified: newUser.isVerified,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error checking existing user" });
  }
};

const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }
    if (user.otp !== otp || (user.otpExpires && user.otpExpires < new Date())) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const SECRET = process.env.JWT_SECRET || "secret";

    const token = jwt.sign({ id: user._id }, SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "User verified successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error while verifying OTP" });
  }
};

const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.find({ email });

    if (!user || user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user[0].password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    if (!user[0].isVerified) {
      return res.status(403).json({ message: "User not verified" });
    }
    const SECRET = process.env.JWT_SECRET || "secret";
    const token = jwt.sign({ id: user[0]._id }, SECRET, { expiresIn: "1h" });
    res.status(200).json({
      message: "User logged in successfully",
      token,
      user: {
        id: user[0]._id,
        name: user[0].name,
        email: user[0].email,
        isVerified: user[0].isVerified,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error logging in user" });
  }
};

const getUserProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await User.findById(userId).select(
      "-password -confirmPassword -otp -otpExpires"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching user profile" });
  }
};

const logoutUser = async (req: Request, res: Response) => {
  return res.status(200).json({
    message: "User logged out successfully.",
  });
};

export {
  registerUser,
  verifyOtp,
  loginUser,
  getUserProfile,
  logoutUser,
};