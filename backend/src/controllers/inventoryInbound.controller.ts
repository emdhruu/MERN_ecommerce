import { Request, Response } from "express";
import mongoose from "mongoose";
import PurchaseOrder from "../models/PurchaseOrder";
import Grn from "../models/Grn";
import Inventory from "../models/Inventory";
import InventoryLedger from "../models/InventoryLedger";
import Product from "../models/Product";

/**
 * Create Purchase Order.
 * IMPORTANT: Creating a PO does NOT increase inventory.
 * Inventory only increases during GRN (Goods Receipt Note).
 */
const createPurchaseOrder = async (req: Request, res: Response) => {
    try {
        const { supplierName, items } = req.body;

        if (!supplierName || !items || !items.length) {
            return res.status(400).json({ message: "supplierName and items are required." });
        }

        // Validate all products exist
        for (const item of items) {
            if (!item.productId || !item.orderedQty || item.orderedQty <= 0) {
                return res.status(400).json({ message: "Each item must have a valid productId and orderedQty > 0." });
            }
            const productExists = await Product.findById(item.productId);
            if (!productExists) {
                return res.status(404).json({ message: `Product not found: ${item.productId}` });
            }
        }

        const po = await PurchaseOrder.create({
            supplierName,
            items: items.map((item: any) => ({
                productId: item.productId,
                orderedQty: item.orderedQty,
                receivedQty: 0
            }))
        });

        return res.status(201).json({ message: "Purchase Order created successfully.", data: po });

    } catch (error: any) {
        console.log("Error creating Purchase Order:", error);
        res.status(500).json({ message: "Server error while creating Purchase Order." });
    }
};

/**
 * Receive Goods (GRN flow).
 * - Receives full or partial goods
 * - Updates inventory (atomic)
 * - Creates ledger entries
 * - Updates PO status (PENDING → PARTIAL → COMPLETED)
 *
 * Edge cases handled:
 * - Receiving more than ordered
 * - Invalid product in GRN
 * - PO already completed
 * - Partial delivery
 */
const receiveGoods = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { purchaseOrderId, items, note } = req.body;

        if (!purchaseOrderId || !items || !items.length) {
            return res.status(400).json({ message: "purchaseOrderId and items are required." });
        }

        // Find the PO
        const po = await PurchaseOrder.findById(purchaseOrderId).session(session);
        if (!po) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Purchase Order not found." });
        }

        if (po.status === "COMPLETED") {
            await session.abortTransaction();
            return res.status(400).json({ message: "This Purchase Order is already completed." });
        }

        // Validate each GRN item against PO items
        for (const grnItem of items) {
            if (!grnItem.productId || !grnItem.receivedQty || grnItem.receivedQty <= 0) {
                await session.abortTransaction();
                return res.status(400).json({ message: "Each item must have a valid productId and receivedQty > 0." });
            }

            const poItem = po.items.find(
                (pi: any) => pi.productId.toString() === grnItem.productId
            );

            if (!poItem) {
                await session.abortTransaction();
                return res.status(400).json({
                    message: `Product ${grnItem.productId} is not part of this Purchase Order.`
                });
            }

            // Check if receiving more than ordered
            const totalReceived = poItem.receivedQty + grnItem.receivedQty;
            if (totalReceived > poItem.orderedQty) {
                await session.abortTransaction();
                return res.status(400).json({
                    message: `Cannot receive more than ordered for product ${grnItem.productId}. Ordered: ${poItem.orderedQty}, Already received: ${poItem.receivedQty}, Trying to receive: ${grnItem.receivedQty}`
                });
            }
        }

        // Create GRN record
        const grn = await Grn.create([{
            purchaseOrderId,
            items,
            note: note || ""
        }], { session });

        // Update inventory and create ledger entries for each item
        for (const grnItem of items) {
            // Update inventory — upsert in case product has no inventory record yet
            await Inventory.findOneAndUpdate(
                { productId: new mongoose.Types.ObjectId(grnItem.productId) },
                {
                    $inc: {
                        availableStock: grnItem.receivedQty,
                        totalStock: grnItem.receivedQty
                    }
                },
                { new: true, upsert: true, session }
            );

            // Create ledger entry
            await InventoryLedger.create([{
                productId: new mongoose.Types.ObjectId(grnItem.productId),
                type: "IN",
                quantity: grnItem.receivedQty,
                reference: "PURCHASE",
                referenceId: new mongoose.Types.ObjectId(purchaseOrderId),
                note: note || `Received ${grnItem.receivedQty} units via GRN`
            }], { session });

            // Update PO item receivedQty
            await PurchaseOrder.updateOne(
                {
                    _id: purchaseOrderId,
                    "items.productId": new mongoose.Types.ObjectId(grnItem.productId)
                },
                {
                    $inc: { "items.$.receivedQty": grnItem.receivedQty }
                },
                { session }
            );
        }

        // Determine PO status after receiving
        const updatedPo = await PurchaseOrder.findById(purchaseOrderId).session(session);
        let newStatus = "PARTIAL";
        if (updatedPo) {
            const allComplete = updatedPo.items.every(
                (item: any) => item.receivedQty >= item.orderedQty
            );
            if (allComplete) {
                newStatus = "COMPLETED";
            }
        }

        await PurchaseOrder.findByIdAndUpdate(
            purchaseOrderId,
            { status: newStatus },
            { session }
        );

        await session.commitTransaction();
        return res.status(200).json({
            message: "Goods received successfully.",
            data: { grn: grn[0], poStatus: newStatus }
        });

    } catch (error: any) {
        await session.abortTransaction();
        console.log("Error receiving goods:", error);
        res.status(500).json({ message: "Server error while receiving goods." });
    } finally {
        session.endSession();
    }
};

/**
 * Get all Purchase Orders with pagination.
 */
const getAllPurchaseOrders = async (req: Request, res: Response) => {
    try {
        let page = Number(req.query.page) || 1;
        let limit = Number(req.query.limit) || 10;
        let skip = (page - 1) * limit;

        const filter: any = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }

        const total = await PurchaseOrder.countDocuments(filter);
        const totalPages = Math.ceil(total / limit);

        const purchaseOrders = await PurchaseOrder.find(filter)
            .populate("items.productId", "name images")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({ page, limit, total, totalPages, data: purchaseOrders });

    } catch (error: any) {
        console.log("Error getting purchase orders:", error);
        res.status(500).json({ message: "Server error, Please try again later." });
    }
};

/**
 * Get single Purchase Order by ID.
 */
const getPurchaseOrderById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const po = await PurchaseOrder.findById(id)
            .populate("items.productId", "name images thumbnail");

        if (!po) {
            return res.status(404).json({ message: "Purchase Order not found." });
        }

        return res.status(200).json({ data: po });

    } catch (error: any) {
        console.log("Error getting purchase order:", error);
        res.status(500).json({ message: "Server error, Please try again later." });
    }
};

/**
 * Get all GRNs for a Purchase Order.
 */
const getGrnsByPurchaseOrder = async (req: Request, res: Response) => {
    try {
        const { purchaseOrderId } = req.params;

        const grns = await Grn.find({ purchaseOrderId })
            .populate("items.productId", "name images")
            .sort({ createdAt: -1 });

        return res.status(200).json({ data: grns });

    } catch (error: any) {
        console.log("Error getting GRNs:", error);
        res.status(500).json({ message: "Server error, Please try again later." });
    }
};

export {
    createPurchaseOrder,
    receiveGoods,
    getAllPurchaseOrders,
    getPurchaseOrderById,
    getGrnsByPurchaseOrder
};
