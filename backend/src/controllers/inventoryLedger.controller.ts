import { Request, Response } from "express";
import mongoose from "mongoose";
import InventoryLedger from "../models/InventoryLedger";

/**
 * Get all ledger entries for a product.
 */
const getLedgerByProduct = async (req: Request, res: Response) => {
    try {
        const productId = req.params.productId as string;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const filter: any = { productId: new mongoose.Types.ObjectId(productId) };

        if (req.query.type) {
            filter.type = req.query.type;
        }

        const total = await InventoryLedger.countDocuments(filter);
        const totalPages = Math.ceil(total / limit);

        const ledger = await InventoryLedger.find(filter)
            .populate("productId", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({ page, limit, total, totalPages, data: ledger });

    } catch (error: any) {
        console.log("Error getting ledger:", error);
        res.status(500).json({ message: "Server error, Please try again later." });
    }
};

/**
 * Get all ledger entries with filters.
 */
const getAllLedgerEntries = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const filter: any = {};

        if (req.query.type) {
            filter.type = String(req.query.type);
        }
        if (req.query.reference) {
            filter.reference = String(req.query.reference);
        }
        if (req.query.productId) {
            filter.productId = new mongoose.Types.ObjectId(String(req.query.productId));
        }

        const total = await InventoryLedger.countDocuments(filter);
        const totalPages = Math.ceil(total / limit);

        const ledger = await InventoryLedger.find(filter)
            .populate("productId", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({ page, limit, total, totalPages, data: ledger });

    } catch (error: any) {
        console.log("Error getting all ledger entries:", error);
        res.status(500).json({ message: "Server error, Please try again later." });
    }
};

export { getLedgerByProduct, getAllLedgerEntries };
