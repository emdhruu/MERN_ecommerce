import { NextFunction, Request, Response } from "express";
import Order from "../models/Order";
import Razorpay from "razorpay";
import crypto from "crypto";

const getRazorpay = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
};

const createPaymentOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findById(orderId);
        if(!order) return res.status(404).json({ message: "Order not found." });
        if (order.orderStatus !== "PAYMENT_PENDING") return res.status(400).json({ message: "Order is not in pending state." });

        const totalInPaise = Math.round(parseFloat(order.totalAmount.toString()) * 100);

         const razorpayOrder = await getRazorpay().orders.create({
            amount: totalInPaise,
            currency: "INR",
            receipt: orderId,
            notes: { orderId },
        });

        return res.status(200).json({
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            orderId,
        });
    } catch (error: any) {
        console.log("Error creating Razorpay order:", error);
        return res.status(500).json({ message: "Failed to create payment order." });
    }
};

// Called after frontend payment success — verifies signature
const verifyPayment = async (req: Request, res: Response) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Payment verification failed." });
        }

        // Signature valid — now call your existing confirmPayment logic
        // You can either call the confirmPayment controller internally
        // or duplicate the logic here. Simplest: make an internal request
        // or just update the order directly:

        return res.status(200).json({
            message: "Payment verified successfully.",
            transactionId: razorpay_payment_id,
        });
    } catch (error: any) {
        console.log("Error verifying payment:", error);
        return res.status(500).json({ message: "Payment verification failed." });
    }
};

export { createPaymentOrder, verifyPayment };