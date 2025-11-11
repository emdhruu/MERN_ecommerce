import { Request, Response } from "express";
import User from "../models/User";

const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find().select("-password -confirmPassword -otp -otpExpires");
        res.status(200).json({ data: users });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};;

const getByIdUser = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id).select("-password -confirmPassword -otp -otpExpires");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ data: user });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateByIdUser = async (req: Request, res: Response) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password -confirmPassword -otp -otpExpires");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ data: user });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

const deleteByIdUser = async (req: Request, res: Response) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

export { getAllUsers, getByIdUser, updateByIdUser, deleteByIdUser };