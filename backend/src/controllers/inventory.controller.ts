import { Request, Response } from "express";
import mongoose from "mongoose";
import Inventory from "../models/Inventory";
import InventoryLedger from "../models/InventoryLedger";
import Product from "../models/Product";
import { sendLowStockAlert } from "../utils/notificationMailer";

/**
 * RESERVE stock — temporarily lock available stock for an order.
 * Uses findOneAndUpdate with condition: availableStock >= quantity
 * This is atomic and race-condition safe.
 */
const reserveStock = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { productId, quantity, orderId } = req.body;

        if (!productId || !quantity || !orderId) {
            return res.status(400).json({ message: "productId, quantity, and orderId are required." });
        }

        if (quantity <= 0) {
            return res.status(400).json({ message: "Quantity must be a positive number." });
        }

        // Atomic update — only succeeds if availableStock >= quantity
        const updated = await Inventory.findOneAndUpdate(
            {
                productId: new mongoose.Types.ObjectId(productId),
                availableStock: { $gte: quantity }
            },
            {
                $inc: {
                    availableStock: -quantity,
                    reservedStock: quantity
                }
            },
            { new: true, session }
        );

        if (!updated) {
            await session.abortTransaction();
            return res.status(422).json({ message: "Insufficient stock to reserve." });
        }

        // Create ledger entry
        await InventoryLedger.create([{
            productId: new mongoose.Types.ObjectId(productId),
            type: "RESERVE",
            quantity,
            reference: "ORDER",
            referenceId: new mongoose.Types.ObjectId(orderId),
            note: `Reserved ${quantity} units for order ${orderId}`
        }], { session });

        await session.commitTransaction();

        // Check if stock fell below threshold — send alert
        if (updated.availableStock <= updated.lowStockThreshold) {
            const product = await Product.findById(productId).select("name");
            if (product) {
                sendLowStockAlert(product.name, updated.availableStock, updated.lowStockThreshold);
            }
        }

        return res.status(200).json({ message: "Stock reserved successfully.", data: updated });

    } catch (error: any) {
        await session.abortTransaction();
        console.log("Error reserving stock:", error);
        res.status(500).json({ message: "Server error while reserving stock." });
    } finally {
        session.endSession();
    }
};

/**
 * RELEASE stock — unlock reserved stock back to available.
 * Used when payment fails or order is cancelled.
 */
const releaseStock = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { productId, quantity, orderId } = req.body;

        if (!productId || !quantity || !orderId) {
            return res.status(400).json({ message: "productId, quantity, and orderId are required." });
        }

        const updated = await Inventory.findOneAndUpdate(
            {
                productId: new mongoose.Types.ObjectId(productId),
                reservedStock: { $gte: quantity }
            },
            {
                $inc: {
                    availableStock: quantity,
                    reservedStock: -quantity
                }
            },
            { new: true, session }
        );

        if (!updated) {
            await session.abortTransaction();
            return res.status(422).json({ message: "Cannot release more than reserved stock." });
        }

        await InventoryLedger.create([{
            productId: new mongoose.Types.ObjectId(productId),
            type: "RELEASE",
            quantity,
            reference: "ORDER",
            referenceId: new mongoose.Types.ObjectId(orderId),
            note: `Released ${quantity} units from order ${orderId}`
        }], { session });

        await session.commitTransaction();
        return res.status(200).json({ message: "Stock released successfully.", data: updated });

    } catch (error: any) {
        await session.abortTransaction();
        console.log("Error releasing stock:", error);
        res.status(500).json({ message: "Server error while releasing stock." });
    } finally {
        session.endSession();
    }
};

/**
 * OUT — final stock consumption after payment confirmation.
 * Decreases reservedStock and totalStock.
 */
const consumeStock = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { productId, quantity, orderId } = req.body;

        if (!productId || !quantity || !orderId) {
            return res.status(400).json({ message: "productId, quantity, and orderId are required." });
        }

        const updated = await Inventory.findOneAndUpdate(
            {
                productId: new mongoose.Types.ObjectId(productId),
                reservedStock: { $gte: quantity }
            },
            {
                $inc: {
                    reservedStock: -quantity,
                    totalStock: -quantity
                }
            },
            { new: true, session }
        );

        if (!updated) {
            await session.abortTransaction();
            return res.status(422).json({ message: "Cannot consume more than reserved stock." });
        }

        await InventoryLedger.create([{
            productId: new mongoose.Types.ObjectId(productId),
            type: "OUT",
            quantity,
            reference: "ORDER",
            referenceId: new mongoose.Types.ObjectId(orderId),
            note: `Consumed ${quantity} units for order ${orderId}`
        }], { session });

        await session.commitTransaction();
        return res.status(200).json({ message: "Stock consumed successfully.", data: updated });

    } catch (error: any) {
        await session.abortTransaction();
        console.log("Error consuming stock:", error);
        res.status(500).json({ message: "Server error while consuming stock." });
    } finally {
        session.endSession();
    }
};

/**
 * ADJUST — manual admin adjustment (corrections, write-offs).
 * Quantity can be positive (add) or negative (remove).
 */
const adjustStock = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { productId, quantity, note } = req.body;

        if (!productId || quantity === undefined || !note) {
            return res.status(400).json({ message: "productId, quantity, and note are required." });
        }

        if (quantity < 0) {
            // Ensure we don't go negative
            const result = await Inventory.findOneAndUpdate(
                {
                    productId: new mongoose.Types.ObjectId(productId),
                    availableStock: { $gte: Math.abs(quantity) }
                },
                {
                    $inc: {
                        availableStock: quantity,
                        totalStock: quantity
                    }
                },
                { new: true, session }
            );

            if (!result) {
                await session.abortTransaction();
                return res.status(422).json({ message: "Insufficient available stock for this adjustment." });
            }
        } else {
            await Inventory.findOneAndUpdate(
                { productId: new mongoose.Types.ObjectId(productId) },
                {
                    $inc: {
                        availableStock: quantity,
                        totalStock: quantity
                    }
                },
                { new: true, upsert: true, session }
            );
        }

        await InventoryLedger.create([{
            productId: new mongoose.Types.ObjectId(productId),
            type: "ADJUST",
            quantity: Math.abs(quantity),
            reference: "ADMIN",
            note
        }], { session });

        await session.commitTransaction();
        return res.status(200).json({ message: "Stock adjusted successfully." });

    } catch (error: any) {
        await session.abortTransaction();
        console.log("Error adjusting stock:", error);
        res.status(500).json({ message: "Server error while adjusting stock." });
    } finally {
        session.endSession();
    }
};

/**
 * Get inventory for a single product.
 */
const getInventoryByProduct = async (req: Request, res: Response) => {
    try {
        const productId = req.params.productId as string;

        const inventory = await Inventory.findOne({
            productId: new mongoose.Types.ObjectId(productId)
        }).populate("productId", "name images thumbnail");

        if (!inventory) {
            return res.status(404).json({ message: "Inventory record not found for this product." });
        }

        return res.status(200).json({ data: inventory });
    } catch (error: any) {
        console.log("Error getting inventory:", error);
        res.status(500).json({ message: "Server error, Please try again later." });
    }
};

/**
 * List all inventory with pagination, low-stock filter, and search.
 */
const getAllInventory = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const lowStock = req.query.lowStock === "true";
        const search = req.query.search ? String(req.query.search) : undefined;

        const pipeline: any[] = [
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" }
        ];

        if (search) {
            pipeline.push({
                $match: {
                    "product.name": { $regex: search, $options: "i" }
                }
            });
        }

        if (lowStock) {
            pipeline.push({
                $match: {
                    $expr: { $lte: ["$availableStock", "$lowStockThreshold"] }
                }
            });
        }

        const countPipeline = [...pipeline, { $count: "total" }];
        const dataPipeline = [...pipeline, { $skip: skip }, { $limit: limit }];

        const [countResult, data] = await Promise.all([
            Inventory.aggregate(countPipeline),
            Inventory.aggregate(dataPipeline)
        ]);

        const total = countResult[0]?.total || 0;
        const totalPages = Math.ceil(total / limit);

        return res.status(200).json({ page, limit, total, totalPages, data });

    } catch (error: any) {
        console.log("Error listing inventory:", error);
        res.status(500).json({ message: "Server error, Please try again later." });
    }
};

/**
 * Get low stock alerts.
 */
const getLowStockAlerts = async (req: Request, res: Response) => {
    try {
        const alerts = await Inventory.aggregate([
            {
                $match: {
                    $expr: { $lte: ["$availableStock", "$lowStockThreshold"] }
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" },
            { $sort: { availableStock: 1 } }
        ]);

        return res.status(200).json({ data: alerts });
    } catch (error: any) {
        console.log("Error getting low stock alerts:", error);
        res.status(500).json({ message: "Server error, Please try again later." });
    }
};

export {
    reserveStock,
    releaseStock,
    consumeStock,
    adjustStock,
    getInventoryByProduct,
    getAllInventory,
    getLowStockAlerts
};
