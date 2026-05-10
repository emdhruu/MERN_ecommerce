import { Request, Response } from "express";
import Charge from "../models/Charge";

const createCharge = async (req: Request, res: Response) => {
    try {
        const { name, type, amount, applicableTo, applicableProducts, applicableCategories, minOrderAmount, maxOrderAmount, maxAmount, isActive } = req.body;

        if (!name || amount === undefined) {
            return res.status(400).json({ message: "Name and amount are required." });
        }

        if (minOrderAmount && maxOrderAmount) {
            return res.status(400).json({ message: "Cannot set both min and max order amount. Use one or none." });
        }

        const charge = await Charge.create({
            name,
            type,
            amount,
            applicableTo,
            applicableProducts: applicableTo === "selective" ? applicableProducts : [],
            applicableCategories: applicableTo === "selective" ? applicableCategories : [],
            minOrderAmount: minOrderAmount || null,
            maxOrderAmount: maxOrderAmount || null,
            maxAmount,
            isActive,
        });

        return res.status(201).json({ message: "Charge created successfully.", data: charge });
    } catch (error: any) {
        return res.status(500).json({ message: error.message || "Failed to create charge." });
    }
};

const getAllCharges = async (req: Request, res: Response) => {
    try {
        const charges = await Charge.find()
            .populate("applicableProducts", "name")
            .populate("applicableCategories", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({ data: charges });
    } catch (error: any) {
        return res.status(500).json({ message: error.message || "Failed to fetch charges." });
    }
};

const updateCharge = async (req: Request, res: Response) => {
    try {
        const { _id, name, type, amount, applicableTo, applicableProducts, applicableCategories, minOrderAmount, maxOrderAmount, maxAmount, isActive } = req.body;

        if (!_id) {
            return res.status(400).json({ message: "Charge ID is required." });
        }

        if (minOrderAmount && maxOrderAmount) {
            return res.status(400).json({ message: "Cannot set both min and max order amount. Use one or none." });
        }

        const charge = await Charge.findByIdAndUpdate(
            _id,
            {
                name,
                type,
                amount,
                applicableTo,
                applicableProducts: applicableTo === "selective" ? applicableProducts : [],
                applicableCategories: applicableTo === "selective" ? applicableCategories : [],
                minOrderAmount: minOrderAmount || null,
                maxOrderAmount: maxOrderAmount || null,
                maxAmount,
                isActive,
            },
            { new: true }
        );

        if (!charge) {
            return res.status(404).json({ message: "Charge not found." });
        }

        return res.status(200).json({ message: "Charge updated successfully.", data: charge });
    } catch (error: any) {
        return res.status(500).json({ message: error.message || "Failed to update charge." });
    }
};

const deleteCharge = async (req: Request, res: Response) => {
    try {
        const { _id } = req.body;

        if (!_id) {
            return res.status(400).json({ message: "Charge ID is required." });
        }

        const charge = await Charge.findByIdAndDelete(_id);

        if (!charge) {
            return res.status(404).json({ message: "Charge not found." });
        }

        return res.status(200).json({ message: "Charge deleted successfully." });
    } catch (error: any) {
        return res.status(500).json({ message: error.message || "Failed to delete charge." });
    }
};

const toggleChargeStatus = async (req: Request, res: Response) => {
    try {
        const { _id } = req.body;

        if (!_id) {
            return res.status(400).json({ message: "Charge ID is required." });
        }

        const charge = await Charge.findById(_id);

        if (!charge) {
            return res.status(404).json({ message: "Charge not found." });
        }

        charge.isActive = !charge.isActive;
        await charge.save();

        return res.status(200).json({ message: "Charge status updated.", data: charge });
    } catch (error: any) {
        return res.status(500).json({ message: error.message || "Failed to toggle charge status." });
    }
};

export { createCharge, getAllCharges, updateCharge, deleteCharge, toggleChargeStatus };
