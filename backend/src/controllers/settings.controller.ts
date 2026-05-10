import { Request, Response } from "express";
import StoreSettings from "../models/StoreSettings";
import NotificationPreferences from "../models/NotificationPreferences";
import Inventory from "../models/Inventory";
import { AuthRequest } from "../middleware/verifyingAccessToken";

/**
 * Get store settings. Creates default if none exist.
 */
const getStoreSettings = async (req: Request, res: Response) => {
    try {
        let settings = await StoreSettings.findOne();
        if (!settings) {
            settings = await StoreSettings.create({});
        }
        return res.status(200).json({ data: settings });
    } catch (error: any) {
        console.log("Error getting store settings:", error);
        res.status(500).json({ message: "Server error, Please try again later." });
    }
};

/**
 * Update store settings.
 * When lowStockThreshold changes, sync it to all inventory records.
 */
const updateStoreSettings = async (req: Request, res: Response) => {
    try {
        const { storeName, currency, currencySymbol, lowStockThreshold, contactEmail, contactPhone } = req.body;

        let settings = await StoreSettings.findOne();
        if (!settings) {
            settings = await StoreSettings.create({});
        }

        const oldThreshold = settings.lowStockThreshold;

        if (storeName !== undefined) settings.storeName = storeName;
        if (currency !== undefined) settings.currency = currency;
        if (currencySymbol !== undefined) settings.currencySymbol = currencySymbol;
        if (lowStockThreshold !== undefined) settings.lowStockThreshold = lowStockThreshold;
        if (contactEmail !== undefined) settings.contactEmail = contactEmail;
        if (contactPhone !== undefined) settings.contactPhone = contactPhone;

        await settings.save();

        // Sync lowStockThreshold to all inventory records if it changed
        if (lowStockThreshold !== undefined && lowStockThreshold !== oldThreshold) {
            await Inventory.updateMany(
                {},
                { $set: { lowStockThreshold: lowStockThreshold } }
            );
        }

        return res.status(200).json({ message: "Store settings updated successfully.", data: settings });
    } catch (error: any) {
        console.log("Error updating store settings:", error);
        res.status(500).json({ message: "Server error, Please try again later." });
    }
};

/**
 * Get notification preferences for current user. Creates default if none exist.
 */
const getNotificationPreferences = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        let prefs = await NotificationPreferences.findOne({ userId });
        if (!prefs) {
            prefs = await NotificationPreferences.create({ userId });
        }

        return res.status(200).json({ data: prefs });
    } catch (error: any) {
        console.log("Error getting notification preferences:", error);
        res.status(500).json({ message: "Server error, Please try again later." });
    }
};

/**
 * Update notification preferences for current user.
 */
const updateNotificationPreferences = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const { lowStockAlerts, newOrders, paymentFailures, dailySummary } = req.body;

        let prefs = await NotificationPreferences.findOne({ userId });
        if (!prefs) {
            prefs = await NotificationPreferences.create({ userId });
        }

        if (lowStockAlerts !== undefined) prefs.lowStockAlerts = lowStockAlerts;
        if (newOrders !== undefined) prefs.newOrders = newOrders;
        if (paymentFailures !== undefined) prefs.paymentFailures = paymentFailures;
        if (dailySummary !== undefined) prefs.dailySummary = dailySummary;

        await prefs.save();

        return res.status(200).json({ message: "Notification preferences updated.", data: prefs });
    } catch (error: any) {
        console.log("Error updating notification preferences:", error);
        res.status(500).json({ message: "Server error, Please try again later." });
    }
};

export { getStoreSettings, updateStoreSettings, getNotificationPreferences, updateNotificationPreferences };
