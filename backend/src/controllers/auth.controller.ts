import User from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import OtpService from "../redis/otp.service";
import { generateAccessToken, generateRefreshToken } from "../utils/tokenHelper";
import { clearCookie, saveCookie } from "../utils/cookieUtils";

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

const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
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

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });
    
    const otpRequestResult = await OtpService.requestOtp(email);
    
    if ('inCooldown' in otpRequestResult && otpRequestResult.inCooldown) {
      return res.status(500).json({ message:  otpRequestResult.message });
    }
    await newUser.save();

    res.status(201).json({
      message: otpRequestResult.message,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        isVerified: newUser.isVerified,
        role: newUser.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error checking existing user" , error: error});
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
    const verificationResult = await OtpService.verifyOtp(email, otp);

    if (!verificationResult.success) {
      return res.status(400).json({
        message: verificationResult.message,
        remainingAttempts: verificationResult.remainingAttempts,
      })
    }

    user.isVerified = true;

    const accessToken = generateAccessToken({ id: user._id });
    const refreshToken = generateRefreshToken({ id: user._id, email: user.email });

    user.refreshToken?.push(refreshToken);

    await user.save();

    saveCookie(res, refreshToken);

    res.status(200).json({
      message: "User verified successfully",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error while verifying OTP" });
  }
};

const resendOtp = async (req: Request, res: Response) => {
   const { email } = req.body;
   if (!email) return res.status(400).json({ message : "Email is required" });

   try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message : "User not found" });
      if (user.isVerified) return res.status(400).json({ message : "User already verified" });

      const otpRequestResult = await OtpService.requestOtp(email);
      
      if ('inCooldown' in otpRequestResult && otpRequestResult.inCooldown) {
        return res.status(500).json({ message:  otpRequestResult.message });
      }

      return res.status(200).json({ message : otpRequestResult.message });
   } catch (error) {
      return res.status(500).json({ message : "Error while resending OTP" });
   }
}

const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(403).json({ message: "Invalid password" });
    }

    if (!user.isVerified) {
      const otpRequestResult = await OtpService.requestOtp(email);

      if ('inCooldown' in otpRequestResult && otpRequestResult.inCooldown){
        return res.status(429).json({
          message: otpRequestResult.message,
          requiresVerification: true
        })
      }
      return res.status(403).json({
        message: `Account not verified. ${otpRequestResult.message}`,
        requiresVerification: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
          role: user.role
        }
      })
    }
    // only generate token for verified users
    const accessToken = generateAccessToken({ id: user._id });
    const refreshToken = generateRefreshToken({ id: user._id, email: user.email });

    user.refreshToken?.push(refreshToken);

    await user.save();

    saveCookie(res, refreshToken);
    res.status(200).json({
      message: "User logged in successfully",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Error logging in user" , error: error});
  }
};

const getUserProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    const user = await User.findById(userId).select(
      "-password -otp -otpExpires -refreshToken"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ data: user });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching user profile" });
  }
};

const logoutUser = async (req: Request, res: Response) => {
  try {
    const cookies = req.cookies;

    if (!cookies?.[process.env.TOKEN_KEY as string]) return res.status(204).json({ message: "No content" });

    const refreshToken = cookies[process.env.TOKEN_KEY as string];

    const user = await User.findOne({ refreshToken });
    
    if (!user || !user.refreshToken) {
      clearCookie(res);
      return res.status(204).json({ message: "No content" });
    }

    let matchedIndex = -1;
    for (let i = 0; i < user.refreshToken?.length; i++){
     if (refreshToken === user.refreshToken[i]) {
        matchedIndex = i;
        break;
      }
    }
    
    if (matchedIndex === -1) {
      user.refreshToken = [];
      await user.save();
      clearCookie(res);
      return res.status(204).json({ message: "No content" });
    }

    user.refreshToken.splice(matchedIndex, 1);
    await user.save();

    clearCookie(res);  
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error logging out user" });
  }
};

const handleRefreshToken = async (req: Request, res: Response) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.[process.env.TOKEN_KEY as string]) return res.status(401).json({ message: "No refresh token provided" });

    const refreshToken = cookies?.[process.env.TOKEN_KEY as string];
    
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET as string);
    } catch (err) {
      clearCookie(res);
      return res.status(403).json({ message: "Forbidden" });
    }
    
    const foundUser = await User.findOneAndUpdate(
      {
        _id: (decoded as any).id,
        refreshToken: refreshToken
      },
      {
        $pull: { refreshToken: refreshToken }
      },
      { new: true }
    );

    if (!foundUser) {
      clearCookie(res);
      return res.status(403).json({ message: "Forbidden - Token already used" });
    }

    const newAccessToken = generateAccessToken({ id: foundUser._id });
    const newRefreshToken = generateRefreshToken({ id: foundUser._id, email: foundUser.email });

    const validTokens = (foundUser.refreshToken || []).filter((token: string) => {
      try {
        jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET as string);
        return true;
      } catch {
        return false;
      }
    });

    await User.findByIdAndUpdate(
      foundUser._id,
      { refreshToken: [...validTokens, newRefreshToken] }
    );

    saveCookie(res, newRefreshToken);

    res.status(200).json({
      accessToken: newAccessToken,
      user: {
        id: foundUser._id,
        name: foundUser.name,
        email: foundUser.email,
        isVerified: foundUser.isVerified,
        role: foundUser.role,
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: "Error refreshing token" });
  }
}

const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required." });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name: name.trim() },
      { new: true }
    ).select("-password -otp -otpExpires -refreshToken");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({ message: "Profile updated successfully.", data: user });
  } catch (error) {
    return res.status(500).json({ message: "Error updating profile." });
  }
};

const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Error changing password." });
  }
};

export {
  registerUser,
  verifyOtp,
  loginUser,
  getUserProfile,
  updateProfile,
  changePassword,
  logoutUser,
  resendOtp,
  handleRefreshToken
};