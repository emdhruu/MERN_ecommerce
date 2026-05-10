import nodemailer from "nodemailer";
import User from "../models/User";
import NotificationPreferences from "../models/NotificationPreferences";
import Order from "../models/Order";
import Inventory from "../models/Inventory";
import StoreSettings from "../models/StoreSettings";

const getTransporter = () => {
    return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

/**
 * Get all admin users who have a specific notification enabled.
 */
const getAdminsWithPref = async (prefKey: string) => {
    const admins = await User.find({ role: "admin", isVerified: true }).select("email name");
    const adminIds = admins.map((a) => a._id);

    const prefs = await NotificationPreferences.find({
        userId: { $in: adminIds },
        [prefKey]: true,
    });

    const enabledUserIds = prefs.map((p) => p.userId.toString());
    return admins.filter((a) => enabledUserIds.includes(a._id.toString()));
};

/**
 * Send low stock alert email to admins who have it enabled.
 */
export const sendLowStockAlert = async (productName: string, availableStock: number, threshold: number) => {
    try {
        const admins = await getAdminsWithPref("lowStockAlerts");
        if (!admins.length) return;

        const transporter = getTransporter();
        const emails = admins.map((a) => a.email).join(",");

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: emails,
            subject: `⚠️ Low Stock Alert: ${productName}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #D54F47;">Low Stock Alert</h2>
                    <p><strong>${productName}</strong> is running low on stock.</p>
                    <table style="border-collapse: collapse; margin-top: 10px;">
                        <tr><td style="padding: 5px 15px 5px 0; color: #666;">Available Stock:</td><td style="font-weight: bold; color: #D54F47;">${availableStock}</td></tr>
                        <tr><td style="padding: 5px 15px 5px 0; color: #666;">Threshold:</td><td>${threshold}</td></tr>
                    </table>
                    <p style="margin-top: 15px; color: #666; font-size: 12px;">This is an automated alert from your store admin panel.</p>
                </div>
            `,
        });
    } catch (error) {
        console.log("Error sending low stock alert email:", error);
    }
};

/**
 * Send new order notification email to admins who have it enabled.
 */
export const sendNewOrderNotification = async (orderId: string, customerName: string, totalAmount: number) => {
    try {
        const admins = await getAdminsWithPref("newOrders");
        if (!admins.length) return;

        const transporter = getTransporter();
        const emails = admins.map((a) => a.email).join(",");

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: emails,
            subject: `🛒 New Order: #${orderId.slice(-8).toUpperCase()}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #10b981;">New Order Received</h2>
                    <table style="border-collapse: collapse; margin-top: 10px;">
                        <tr><td style="padding: 5px 15px 5px 0; color: #666;">Order ID:</td><td style="font-weight: bold;">#${orderId.slice(-8).toUpperCase()}</td></tr>
                        <tr><td style="padding: 5px 15px 5px 0; color: #666;">Customer:</td><td>${customerName}</td></tr>
                        <tr><td style="padding: 5px 15px 5px 0; color: #666;">Total:</td><td style="font-weight: bold;">₹${totalAmount.toFixed(2)}</td></tr>
                    </table>
                    <p style="margin-top: 15px; color: #666; font-size: 12px;">This is an automated notification from your store admin panel.</p>
                </div>
            `,
        });
    } catch (error) {
        console.log("Error sending new order notification email:", error);
    }
};

/**
 * Send payment failure notification email to admins who have it enabled.
 */
export const sendPaymentFailureNotification = async (orderId: string, customerName: string) => {
    try {
        const admins = await getAdminsWithPref("paymentFailures");
        if (!admins.length) return;

        const transporter = getTransporter();
        const emails = admins.map((a) => a.email).join(",");

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: emails,
            subject: `❌ Payment Failed: Order #${orderId.slice(-8).toUpperCase()}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #D54F47;">Payment Failure</h2>
                    <p>A payment has failed for the following order:</p>
                    <table style="border-collapse: collapse; margin-top: 10px;">
                        <tr><td style="padding: 5px 15px 5px 0; color: #666;">Order ID:</td><td style="font-weight: bold;">#${orderId.slice(-8).toUpperCase()}</td></tr>
                        <tr><td style="padding: 5px 15px 5px 0; color: #666;">Customer:</td><td>${customerName}</td></tr>
                    </table>
                    <p style="margin-top: 10px;">Reserved stock has been released back to available inventory.</p>
                    <p style="margin-top: 15px; color: #666; font-size: 12px;">This is an automated notification from your store admin panel.</p>
                </div>
            `,
        });
    } catch (error) {
        console.log("Error sending payment failure notification email:", error);
    }
};

/**
 * Send daily summary email at 11 PM to admins who have it enabled.
 */
export const sendDailySummary = async () => {
    try {
        const admins = await getAdminsWithPref("dailySummary");
        if (!admins.length) return;

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // Today's stats
        const [todayOrders, todayRevenue, lowStockItems, pendingOrders] = await Promise.all([
            Order.countDocuments({ createdAt: { $gte: todayStart } }),
            Order.aggregate([
                { $match: { orderStatus: { $in: ["CONFIRMED", "DELIVERED"] }, createdAt: { $gte: todayStart } } },
                { $group: { _id: null, total: { $sum: { $toDouble: "$totalAmount" } } } }
            ]),
            Inventory.countDocuments({ $expr: { $lte: ["$availableStock", "$lowStockThreshold"] } }),
            Order.countDocuments({ orderStatus: { $in: ["PENDING", "PAYMENT_PENDING"] } }),
        ]);

        const revenue = todayRevenue[0]?.total || 0;
        const storeSettings = await StoreSettings.findOne();
        const storeName = storeSettings?.storeName || "MERN-eKART";
        const currencySymbol = storeSettings?.currencySymbol || "₹";

        const transporter = getTransporter();
        const emails = admins.map((a) => a.email).join(",");
        const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: emails,
            subject: `📊 Daily Summary — ${storeName} — ${dateStr}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
                    <h2 style="color: #1f2937; border-bottom: 2px solid #D54F47; padding-bottom: 10px;">
                        ${storeName} — Daily Summary
                    </h2>
                    <p style="color: #666; margin-bottom: 20px;">${dateStr}</p>
                    
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background: #f9fafb;">
                            <td style="padding: 12px 15px; border: 1px solid #e5e7eb; font-weight: bold;">Today's Orders</td>
                            <td style="padding: 12px 15px; border: 1px solid #e5e7eb; text-align: right; font-size: 18px;">${todayOrders}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 15px; border: 1px solid #e5e7eb; font-weight: bold;">Today's Revenue</td>
                            <td style="padding: 12px 15px; border: 1px solid #e5e7eb; text-align: right; font-size: 18px; color: #10b981;">${currencySymbol}${revenue.toLocaleString()}</td>
                        </tr>
                        <tr style="background: #f9fafb;">
                            <td style="padding: 12px 15px; border: 1px solid #e5e7eb; font-weight: bold;">Pending Orders</td>
                            <td style="padding: 12px 15px; border: 1px solid #e5e7eb; text-align: right; font-size: 18px; color: #f59e0b;">${pendingOrders}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 15px; border: 1px solid #e5e7eb; font-weight: bold;">Low Stock Items</td>
                            <td style="padding: 12px 15px; border: 1px solid #e5e7eb; text-align: right; font-size: 18px; color: ${lowStockItems > 0 ? '#D54F47' : '#10b981'};">${lowStockItems}</td>
                        </tr>
                    </table>

                    <p style="margin-top: 20px; padding: 10px; background: #f3f4f6; border-radius: 6px; font-size: 13px; color: #666;">
                        This is your automated daily summary report. You can disable this in your notification preferences.
                    </p>
                </div>
            `,
        });

        console.log(`Daily summary sent to ${admins.length} admin(s).`);
    } catch (error) {
        console.log("Error sending daily summary:", error);
    }
};

export const sendOrderConfirmationToCustomer = async (orderId: string, customerEmail: string, customerName: string, totalAmount: number) => {
    try {
        const transporter = getTransporter();
        const storeSettings = await StoreSettings.findOne();
        const storeName = storeSettings?.storeName || "MERN-eKART";

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: customerEmail,
            subject: `✅ Order Confirmed — #${orderId.slice(-8).toUpperCase()}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
                    <h2 style="color: #D54F47;">${storeName}</h2>
                    <h3 style="color: #1f2937;">Order Placed Successfully!</h3>
                    <p>Hi ${customerName},</p>
                    <p>Your order has been placed and is being processed.</p>
                    <table style="border-collapse: collapse; margin-top: 10px;">
                        <tr><td style="padding: 5px 15px 5px 0; color: #666;">Order ID:</td><td style="font-weight: bold;">#${orderId.slice(-8).toUpperCase()}</td></tr>
                        <tr><td style="padding: 5px 15px 5px 0; color: #666;">Total:</td><td style="font-weight: bold;">₹${totalAmount.toFixed(2)}</td></tr>
                    </table>
                    <p style="margin-top: 15px;">We'll notify you when your order status changes.</p>
                    <p style="margin-top: 15px; color: #666; font-size: 12px;">Thank you for shopping with ${storeName}.</p>
                </div>
            `,
        });
    } catch (error) {
        console.log("Error sending order confirmation to customer:", error);
    }
};

export const sendOrderStatusUpdateToCustomer = async (orderId: string, customerEmail: string, customerName: string, newStatus: string) => {
    try {
        const transporter = getTransporter();
        const storeSettings = await StoreSettings.findOne();
        const storeName = storeSettings?.storeName || "MERN-eKART";

        const statusMessages: Record<string, { emoji: string; title: string; message: string }> = {
            CONFIRMED: { emoji: "✅", title: "Order Confirmed", message: "Your payment has been confirmed and your order is being prepared." },
            DELIVERED: { emoji: "📦", title: "Order Delivered", message: "Your order has been delivered. We hope you enjoy your purchase!" },
            CANCELLED: { emoji: "❌", title: "Order Cancelled", message: "Your order has been cancelled. If you didn't request this, please contact support." },
            FAILED: { emoji: "⚠️", title: "Payment Failed", message: "Your payment could not be processed. Please try again or use a different payment method." },
        };

        const info = statusMessages[newStatus] || { emoji: "📋", title: `Order ${newStatus}`, message: `Your order status has been updated to ${newStatus}.` };

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: customerEmail,
            subject: `${info.emoji} ${info.title} — Order #${orderId.slice(-8).toUpperCase()}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
                    <h2 style="color: #D54F47;">${storeName}</h2>
                    <h3 style="color: #1f2937;">${info.title}</h3>
                    <p>Hi ${customerName},</p>
                    <p>${info.message}</p>
                    <table style="border-collapse: collapse; margin-top: 10px;">
                        <tr><td style="padding: 5px 15px 5px 0; color: #666;">Order ID:</td><td style="font-weight: bold;">#${orderId.slice(-8).toUpperCase()}</td></tr>
                        <tr><td style="padding: 5px 15px 5px 0; color: #666;">Status:</td><td style="font-weight: bold;">${newStatus}</td></tr>
                    </table>
                    <p style="margin-top: 15px; color: #666; font-size: 12px;">Thank you for shopping with ${storeName}.</p>
                </div>
            `,
        });
    } catch (error) {
        console.log("Error sending order status update to customer:", error);
    }
};
