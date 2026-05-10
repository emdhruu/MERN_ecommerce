import { Request, Response } from "express";
import Tax from "../models/Tax";

const createTax = async (req: Request, res: Response) => {
    try {
        const { name, rate, applicableTo, applicableProducts, applicableCategories, isActive } = req.body;

        if (!name || rate === undefined) {
            return res.status(400).json({ message: "Name and rate are required." });
        }

        const tax = await Tax.create({
            name,
            rate,
            applicableTo,
            applicableProducts: applicableTo === "selective" ? applicableProducts : [],
            applicableCategories: applicableTo === "selective" ? applicableCategories : [],
            isActive,
        });

        return res.status(201).json({ message: "Tax created successfully.", data: tax });
    } catch (error: any) {
        return res.status(500).json({ message: error.message || "Failed to create tax." });
    }
};

const getAllTaxes = async (req: Request, res: Response) => {
    try {
        const taxes = await Tax.find()
            .populate("applicableProducts", "name")
            .populate("applicableCategories", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({ data: taxes });
    } catch (error: any) {
        return res.status(500).json({ message: error.message || "Failed to fetch taxes." });
    }
};

const updateTax = async (req: Request, res: Response) => {
    try {
        const { _id, name, rate, applicableTo, applicableProducts, applicableCategories, isActive } = req.body;

        if (!_id) {
            return res.status(400).json({ message: "Tax ID is required." });
        }

        const tax = await Tax.findByIdAndUpdate(
            _id,
            {
                name,
                rate,
                applicableTo,
                applicableProducts: applicableTo === "selective" ? applicableProducts : [],
                applicableCategories: applicableTo === "selective" ? applicableCategories : [],
                isActive,
            },
            { new: true }
        );

        if (!tax) {
            return res.status(404).json({ message: "Tax not found." });
        }

        return res.status(200).json({ message: "Tax updated successfully.", data: tax });
    } catch (error: any) {
        return res.status(500).json({ message: error.message || "Failed to update tax." });
    }
};

const deleteTax = async (req: Request, res: Response) => {
    try {
        const { _id } = req.body;

        if (!_id) {
            return res.status(400).json({ message: "Tax ID is required." });
        }

        const tax = await Tax.findByIdAndDelete(_id);

        if (!tax) {
            return res.status(404).json({ message: "Tax not found." });
        }

        return res.status(200).json({ message: "Tax deleted successfully." });
    } catch (error: any) {
        return res.status(500).json({ message: error.message || "Failed to delete tax." });
    }
};

const toggleTaxStatus = async (req: Request, res: Response) => {
    try {
        const { _id } = req.body;

        if (!_id) {
            return res.status(400).json({ message: "Tax ID is required." });
        }

        const tax = await Tax.findById(_id);

        if (!tax) {
            return res.status(404).json({ message: "Tax not found." });
        }

        tax.isActive = !tax.isActive;
        await tax.save();

        return res.status(200).json({ message: "Tax status updated.", data: tax });
    } catch (error: any) {
        return res.status(500).json({ message: error.message || "Failed to toggle tax status." });
    }
};

export { createTax, getAllTaxes, updateTax, deleteTax, toggleTaxStatus };
