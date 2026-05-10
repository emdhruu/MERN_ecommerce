import { Request, Response } from "express";
import mongoose from "mongoose";
import Order from "../models/Order";
import Product from "../models/Product";
import Inventory from "../models/Inventory";
import InventoryLedger from "../models/InventoryLedger";
import Coupon from "../models/Coupon";
import { AuthRequest } from "../middleware/verifyingAccessToken";
import { sendNewOrderNotification, sendPaymentFailureNotification, sendOrderConfirmationToCustomer, sendOrderStatusUpdateToCustomer } from "../utils/notificationMailer";

/**
 * Create Order — reserves inventory atomically.
 * Flow:
 * 1. Validate items and calculate total
 * 2. Reserve stock for each item (atomic findOneAndUpdate)
 * 3. Create order with status PAYMENT_PENDING
 * 4. If any reserve fails, rollback all previous reserves
 */
const createOrder = async (req: AuthRequest, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { items, address, paymentMethod, couponCode } = req.body;
        const userId = req.user?._id;

        if (!items || !items.length || !address || !paymentMethod) {
            return res.status(400).json({ message: "items, address, and paymentMethod are required." });
        }

        let totalAmount = 0;
        const orderItems: any[] = [];

        for (const item of items) {
            if (!item.product || !item.quantity || item.quantity <= 0) {
                await session.abortTransaction();
                return res.status(400).json({ message: "Each item must have a valid product and quantity > 0." });
            }

            const product = await Product.findById(item.product).session(session);
            if (!product) {
                await session.abortTransaction();
                return res.status(404).json({ message: `Product not found: ${item.product}` });
            }

            if (product.isDeleted) {
                await session.abortTransaction();
                return res.status(400).json({ message: `Product is no longer available: ${product.name}` });
            }

            const price = product.salesPrice
                ? parseFloat(product.salesPrice.toString())
                : parseFloat(product.price.toString());

            totalAmount += price * item.quantity;
            orderItems.push({
                product: item.product,
                quantity: item.quantity,
                price
            });
        }

        let discount = 0;
        let appliedCouponCode: string | null = null;

        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true }).session(session);

            if (coupon) {
                const currentDate = new Date();
                const isValid = (!coupon.validFrom || coupon.validFrom <= currentDate) &&
                                (!coupon.validUntil || coupon.validUntil >= currentDate);

                if (isValid) {
                    if (coupon.discountType === "percentage") {
                        discount = (totalAmount * coupon.discountValue) / 100;
                        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                            discount = coupon.maxDiscount;
                        }
                    } else if (coupon.discountType === "fixed") {
                        discount = coupon.discountValue;
                    }

                    if (coupon.minPurchaseAmount && totalAmount < Number(coupon.minPurchaseAmount)) {
                        discount = 0;
                    }

                    if (discount > 0) {
                        appliedCouponCode = coupon.code;

                        coupon.usedBy.push({ userId: userId, usedAt: new Date() });
                        if (coupon.usageLimit && coupon.usageLimit > 0) {
                            coupon.usageLimit -= 1;
                        }
                        await coupon.save({ session });
                    }
                }
            }
        }

        const finalAmount = Math.max(totalAmount - discount, 0);

        // Reserve stock for each item — atomic and race-condition safe
        for (const item of orderItems) {
            const reserved = await Inventory.findOneAndUpdate(
                {
                    productId: new mongoose.Types.ObjectId(item.product),
                    availableStock: { $gte: item.quantity }
                },
                {
                    $inc: {
                        availableStock: -item.quantity,
                        reservedStock: item.quantity
                    }
                },
                { new: true, session }
            );

            if (!reserved) {
                await session.abortTransaction();
                return res.status(422).json({
                    message: `Insufficient stock for product ${item.product}. Order cannot be placed.`
                });
            }

            // Create RESERVE ledger entry
            await InventoryLedger.create([{
                productId: new mongoose.Types.ObjectId(item.product),
                type: "RESERVE",
                quantity: item.quantity,
                reference: "ORDER",
                note: `Reserved for new order`
            }], { session });
        }

        // Create the order
        const order = await Order.create([{
            user: userId,
            items: orderItems,
            address,
            paymentMethod,
            paymentStatus: "pending",
            subtotal: totalAmount,
            totalAmount: finalAmount,
            couponCode: appliedCouponCode,
            discount,
            orderStatus: "PAYMENT_PENDING"
        }], { session });

        // Update ledger entries with the order referenceId
        for (const item of orderItems) {
            await InventoryLedger.updateMany(
                {
                    productId: new mongoose.Types.ObjectId(item.product),
                    type: "RESERVE",
                    referenceId: null
                },
                { referenceId: order[0]._id },
                { session }
            );
        }

        await session.commitTransaction();

        // Send new order notification email (non-blocking)
        sendNewOrderNotification(order[0]._id.toString(), req.user?.name || "Customer", finalAmount);
        sendOrderConfirmationToCustomer(order[0]._id.toString(), req.user?.email || "", req.user?.name || "Customer", finalAmount);

        return res.status(201).json({ message: "Order created successfully.", data: order[0] });

    } catch (error: any) {
        await session.abortTransaction();
        console.log("Error creating order:", error);
        res.status(500).json({ message: "Server error while creating order." });
    } finally {
        session.endSession();
    }
};

/**
 * Confirm Payment — consumes reserved stock.
 * Flow:
 * 1. Verify order exists and is in PAYMENT_PENDING status
 * 2. For each item: reservedStock decreases, totalStock decreases
 * 3. Create OUT ledger entries
 * 4. Update order status to CONFIRMED
 */
const confirmPayment = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const orderId = req.params.orderId as string;
        const { transactionId } = req.body;

        const order = await Order.findById(orderId).session(session);
        if (!order) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Order not found." });
        }

        if (order.orderStatus !== "PAYMENT_PENDING") {
            await session.abortTransaction();
            return res.status(400).json({ message: `Cannot confirm payment for order in ${order.orderStatus} status.` });
        }

        // Consume stock for each item
        for (const item of order.items) {
            const consumed = await Inventory.findOneAndUpdate(
                {
                    productId: new mongoose.Types.ObjectId(item.product.toString()),
                    reservedStock: { $gte: item.quantity }
                },
                {
                    $inc: {
                        reservedStock: -item.quantity,
                        totalStock: -item.quantity
                    }
                },
                { new: true, session }
            );

            if (!consumed) {
                await session.abortTransaction();
                return res.status(422).json({ message: "Error consuming reserved stock." });
            }

            // Create OUT ledger entry
            await InventoryLedger.create([{
                productId: new mongoose.Types.ObjectId(item.product.toString()),
                type: "OUT",
                quantity: item.quantity,
                reference: "ORDER",
                referenceId: new mongoose.Types.ObjectId(orderId),
                note: `Stock consumed for confirmed order ${orderId}`
            }], { session });
        }

        // Update order status
        order.orderStatus = "CONFIRMED";
        order.paymentStatus = "completed";
        if (transactionId) {
            order.transactionId = transactionId;
        }
        await order.save({ session });

        await session.commitTransaction();

        const populatedOrder = await Order.findById(orderId).populate("user", "name email");
        if (populatedOrder?.user) {
            const u = populatedOrder.user as any;
            sendOrderStatusUpdateToCustomer(orderId, u.email, u.name, "CONFIRMED");
        }

        return res.status(200).json({ message: "Payment confirmed. Order is now confirmed.", data: order });

    } catch (error: any) {
        await session.abortTransaction();
        console.log("Error confirming payment:", error);
        res.status(500).json({ message: "Server error while confirming payment." });
    } finally {
        session.endSession();
    }
};

/**
 * Cancel Order / Payment Failure — releases reserved stock.
 * Flow:
 * 1. Verify order exists and is in PAYMENT_PENDING or PENDING status
 * 2. For each item: release reserved stock back to available
 * 3. Create RELEASE ledger entries
 * 4. Update order status to CANCELLED or FAILED
 */
const cancelOrder = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const orderId = req.params.orderId as string;
        const { reason } = req.body;

        const order = await Order.findById(orderId).session(session);
        if (!order) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Order not found." });
        }

        if (!["PENDING", "PAYMENT_PENDING"].includes(order.orderStatus)) {
            await session.abortTransaction();
            return res.status(400).json({ message: `Cannot cancel order in ${order.orderStatus} status.` });
        }

        // Release stock for each item
        for (const item of order.items) {
            const released = await Inventory.findOneAndUpdate(
                {
                    productId: new mongoose.Types.ObjectId(item.product.toString()),
                    reservedStock: { $gte: item.quantity }
                },
                {
                    $inc: {
                        availableStock: item.quantity,
                        reservedStock: -item.quantity
                    }
                },
                { new: true, session }
            );

            if (!released) {
                await session.abortTransaction();
                return res.status(422).json({ message: "Error releasing reserved stock." });
            }

            // Create RELEASE ledger entry
            await InventoryLedger.create([{
                productId: new mongoose.Types.ObjectId(item.product.toString()),
                type: "RELEASE",
                quantity: item.quantity,
                reference: "ORDER",
                referenceId: new mongoose.Types.ObjectId(orderId),
                note: reason || `Stock released due to order cancellation`
            }], { session });
        }

        // Update order status
        order.orderStatus = "CANCELLED";
        order.paymentStatus = "failed";
        await order.save({ session });

        await session.commitTransaction();

        const populatedOrder = await Order.findById(orderId).populate("user", "name email");
        if (populatedOrder?.user) {
            const u = populatedOrder.user as any;
            sendOrderStatusUpdateToCustomer(orderId, u.email, u.name, "CANCELLED");
        }

        return res.status(200).json({ message: "Order cancelled. Stock released.", data: order });

    } catch (error: any) {
        await session.abortTransaction();
        console.log("Error cancelling order:", error);
        res.status(500).json({ message: "Server error while cancelling order." });
    } finally {
        session.endSession();
    }
};

/**
 * Payment failure webhook handler.
 * Same as cancel but sets status to FAILED.
 */
const paymentFailed = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const orderId = req.params.orderId as string;

        const order = await Order.findById(orderId).session(session);
        if (!order) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Order not found." });
        }

        if (order.orderStatus !== "PAYMENT_PENDING") {
            await session.abortTransaction();
            return res.status(400).json({ message: `Order is not in PAYMENT_PENDING status.` });
        }

        // Release stock for each item
        for (const item of order.items) {
            await Inventory.findOneAndUpdate(
                {
                    productId: new mongoose.Types.ObjectId(item.product.toString()),
                    reservedStock: { $gte: item.quantity }
                },
                {
                    $inc: {
                        availableStock: item.quantity,
                        reservedStock: -item.quantity
                    }
                },
                { new: true, session }
            );

            await InventoryLedger.create([{
                productId: new mongoose.Types.ObjectId(item.product.toString()),
                type: "RELEASE",
                quantity: item.quantity,
                reference: "ORDER",
                referenceId: new mongoose.Types.ObjectId(orderId),
                note: `Stock released due to payment failure`
            }], { session });
        }

        order.orderStatus = "FAILED";
        order.paymentStatus = "failed";
        await order.save({ session });

        await session.commitTransaction();

        // Send payment failure notification email (non-blocking)
        sendPaymentFailureNotification(orderId, order.user?.toString() || "");

        const populatedOrder = await Order.findById(orderId).populate("user", "name email");
        if (populatedOrder?.user) {
            const u = populatedOrder.user as any;
            sendOrderStatusUpdateToCustomer(orderId, u.email, u.name, "FAILED");
        }

        return res.status(200).json({ message: "Payment failure processed. Stock released.", data: order });

    } catch (error: any) {
        await session.abortTransaction();
        console.log("Error processing payment failure:", error);
        res.status(500).json({ message: "Server error while processing payment failure." });
    } finally {
        session.endSession();
    }
};

/**
 * Mark order as delivered.
 */
const markDelivered = async (req: Request, res: Response) => {
    try {
        const orderId = req.params.orderId as string;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        if (order.orderStatus !== "CONFIRMED") {
            return res.status(400).json({ message: `Cannot mark as delivered. Order is in ${order.orderStatus} status.` });
        }

        order.orderStatus = "DELIVERED";
        await order.save();

        const populatedOrder = await Order.findById(orderId).populate("user", "name email");
        if (populatedOrder?.user) {
            const u = populatedOrder.user as any;
            sendOrderStatusUpdateToCustomer(orderId, u.email, u.name, "DELIVERED");
        }

        return res.status(200).json({ message: "Order marked as delivered.", data: order });

    } catch (error: any) {
        console.log("Error marking order as delivered:", error);
        res.status(500).json({ message: "Server error, Please try again later." });
    }
};

/**
 * Get order by ID.
 */
const getOrderById = async (req: AuthRequest, res: Response) => {
    try {
        const orderId = req.params.orderId as string;

        const order = await Order.findById(orderId)
            .populate("items.product", "name images thumbnail price salesPrice")
            .populate("address")
            .populate("user", "name email");

        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        return res.status(200).json({ data: order });

    } catch (error: any) {
        console.log("Error getting order:", error);
        res.status(500).json({ message: "Server error, Please try again later." });
    }
};

/**
 * Get all orders for current user.
 */
const getMyOrders = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        let page = Number(req.query.page) || 1;
        let limit = Number(req.query.limit) || 10;
        let skip = (page - 1) * limit;

        const total = await Order.countDocuments({ user: userId });
        const totalPages = Math.ceil(total / limit);

        const orders = await Order.find({ user: userId })
            .populate("items.product", "name images thumbnail")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({ page, limit, total, totalPages, data: orders });

    } catch (error: any) {
        console.log("Error getting user orders:", error);
        res.status(500).json({ message: "Server error, Please try again later." });
    }
};

/**
 * Get all orders (Admin).
 */
const getAllOrders = async (req: Request, res: Response) => {
    try {
        let page = Number(req.query.page) || 1;
        let limit = Number(req.query.limit) || 10;
        let skip = (page - 1) * limit;

        const filter: any = {};
        if (req.query.status) {
            filter.orderStatus = req.query.status;
        }
        if (req.query.paymentStatus) {
            filter.paymentStatus = req.query.paymentStatus;
        }

        const total = await Order.countDocuments(filter);
        const totalPages = Math.ceil(total / limit);

        const orders = await Order.find(filter)
            .populate("items.product", "name images thumbnail")
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({ page, limit, total, totalPages, data: orders });

    } catch (error: any) {
        console.log("Error getting all orders:", error);
        res.status(500).json({ message: "Server error, Please try again later." });
    }
};

export {
    createOrder,
    confirmPayment,
    cancelOrder,
    paymentFailed,
    markDelivered,
    getOrderById,
    getMyOrders,
    getAllOrders
};
