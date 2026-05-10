import { Request, Response } from "express";
import mongoose from "mongoose";
import Invoice from "../models/Invoice";
import Order from "../models/Order";
import PurchaseOrder from "../models/PurchaseOrder";
import Product from "../models/Product";

/**
 * Generate unique invoice number: INV-SALES-20260507-001 or INV-PUR-20260507-001
 */
const generateInvoiceNumber = async (type: "SALES" | "PURCHASE") => {
    const prefix = type === "SALES" ? "INV-SALES" : "INV-PUR";
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");

    const count = await Invoice.countDocuments({
        invoiceNumber: { $regex: `^${prefix}-${dateStr}` }
    });

    const seq = String(count + 1).padStart(3, "0");
    return `${prefix}-${dateStr}-${seq}`;
};

/**
 * Create sales invoice from a confirmed order.
 */
const createSalesInvoice = async (req: Request, res: Response) => {
    try {
        const { orderId, taxRate, discount, notes } = req.body;

        if (!orderId) {
            return res.status(400).json({ message: "orderId is required." });
        }

        // Check if invoice already exists for this order
        const existing = await Invoice.findOne({ orderId });
        if (existing) {
            return res.status(400).json({ message: "Invoice already exists for this order.", data: existing });
        }

        const order = await Order.findById(orderId)
            .populate("items.product", "name price salesPrice")
            .populate("user", "name email");

        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        if (!["CONFIRMED", "DELIVERED"].includes(order.orderStatus)) {
            return res.status(400).json({ message: "Can only create invoice for confirmed or delivered orders." });
        }

        const items = order.items.map((item: any) => {
            const unitPrice = item.price
                ? (typeof item.price === "object" ? parseFloat(item.price.$numberDecimal || item.price.toString()) : Number(item.price))
                : 0;
            return {
                productId: item.product?._id || item.product,
                name: item.product?.name || "Product",
                quantity: item.quantity,
                unitPrice,
                total: unitPrice * item.quantity
            };
        });

        const subtotal = items.reduce((sum: number, i: any) => sum + i.total, 0);
        const taxAmount = taxRate ? (subtotal * taxRate) / 100 : 0;
        const discountAmount = discount || 0;
        const totalAmount = subtotal + taxAmount - discountAmount;

        const invoiceNumber = await generateInvoiceNumber("SALES");

        const invoice = await Invoice.create({
            invoiceNumber,
            type: "SALES",
            orderId,
            customer: {
                name: (order.user as any)?.name || "",
                email: (order.user as any)?.email || ""
            },
            items,
            subtotal,
            tax: taxAmount,
            taxRate: taxRate || 0,
            discount: discountAmount,
            totalAmount,
            status: order.paymentStatus === "completed" ? "PAID" : "ISSUED",
            notes,
            issuedAt: new Date()
        });

        return res.status(201).json({ message: "Sales invoice created.", data: invoice });

    } catch (error: any) {
        console.log("Error creating sales invoice:", error);
        res.status(500).json({ message: "Server error while creating invoice." });
    }
};

/**
 * Create purchase invoice from a purchase order.
 */
const createPurchaseInvoice = async (req: Request, res: Response) => {
    try {
        const { purchaseOrderId, taxRate, notes } = req.body;

        if (!purchaseOrderId) {
            return res.status(400).json({ message: "purchaseOrderId is required." });
        }

        const existing = await Invoice.findOne({ purchaseOrderId });
        if (existing) {
            return res.status(400).json({ message: "Invoice already exists for this purchase order.", data: existing });
        }

        const po = await PurchaseOrder.findById(purchaseOrderId)
            .populate("items.productId", "name price");

        if (!po) {
            return res.status(404).json({ message: "Purchase Order not found." });
        }

        const items = po.items.map((item: any) => {
            const product = item.productId;
            const unitPrice = product?.price
                ? (typeof product.price === "object" ? parseFloat(product.price.$numberDecimal || product.price.toString()) : Number(product.price))
                : 0;
            return {
                productId: product?._id || item.productId,
                name: product?.name || "Product",
                quantity: item.receivedQty || item.orderedQty,
                unitPrice,
                total: unitPrice * (item.receivedQty || item.orderedQty)
            };
        });

        const subtotal = items.reduce((sum: number, i: any) => sum + i.total, 0);
        const taxAmount = taxRate ? (subtotal * taxRate) / 100 : 0;
        const totalAmount = subtotal + taxAmount;

        const invoiceNumber = await generateInvoiceNumber("PURCHASE");

        const invoice = await Invoice.create({
            invoiceNumber,
            type: "PURCHASE",
            purchaseOrderId,
            supplier: { name: po.supplierName },
            items,
            subtotal,
            tax: taxAmount,
            taxRate: taxRate || 0,
            totalAmount,
            status: "ISSUED",
            notes,
            issuedAt: new Date()
        });

        return res.status(201).json({ message: "Purchase invoice created.", data: invoice });

    } catch (error: any) {
        console.log("Error creating purchase invoice:", error);
        res.status(500).json({ message: "Server error while creating invoice." });
    }
};

/**
 * Get all invoices with pagination and filters.
 */
const getAllInvoices = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter: any = {};
        if (req.query.type) filter.type = String(req.query.type);
        if (req.query.status) filter.status = String(req.query.status);

        const total = await Invoice.countDocuments(filter);
        const totalPages = Math.ceil(total / limit);

        const invoices = await Invoice.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({ page, limit, total, totalPages, data: invoices });

    } catch (error: any) {
        console.log("Error getting invoices:", error);
        res.status(500).json({ message: "Server error, Please try again later." });
    }
};

/**
 * Get invoice by ID.
 */
const getInvoiceById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const invoice = await Invoice.findById(id)
            .populate("orderId", "orderStatus paymentStatus")
            .populate("purchaseOrderId", "status supplierName");

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found." });
        }

        return res.status(200).json({ data: invoice });

    } catch (error: any) {
        console.log("Error getting invoice:", error);
        res.status(500).json({ message: "Server error, Please try again later." });
    }
};

/**
 * Update invoice status.
 */
const updateInvoiceStatus = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { status } = req.body;

        if (!["DRAFT", "ISSUED", "PAID", "CANCELLED"].includes(status)) {
            return res.status(400).json({ message: "Invalid status." });
        }

        const invoice = await Invoice.findByIdAndUpdate(id, { status }, { new: true });
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found." });
        }

        return res.status(200).json({ message: "Invoice status updated.", data: invoice });

    } catch (error: any) {
        console.log("Error updating invoice:", error);
        res.status(500).json({ message: "Server error, Please try again later." });
    }
};

export {
    createSalesInvoice,
    createPurchaseInvoice,
    getAllInvoices,
    getInvoiceById,
    updateInvoiceStatus
};
