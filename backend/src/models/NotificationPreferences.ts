import { model, Schema, Types } from "mongoose";

const notificationPreferencesSchema = new Schema({
    userId: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    lowStockAlerts: {
        type: Boolean,
        default: true
    },
    newOrders: {
        type: Boolean,
        default: true
    },
    paymentFailures: {
        type: Boolean,
        default: true
    },
    dailySummary: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const NotificationPreferences = model("NotificationPreferences", notificationPreferencesSchema);

export default NotificationPreferences;
