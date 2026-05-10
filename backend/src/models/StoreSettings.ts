import { model, Schema } from "mongoose";

const storeSettingsSchema = new Schema({
    storeName: {
        type: String,
        default: "MERN-eKART"
    },
    currency: {
        type: String,
        enum: ["USD", "EUR", "INR", "GBP"],
        default: "USD"
    },
    currencySymbol: {
        type: String,
        default: "$"
    },
    lowStockThreshold: {
        type: Number,
        default: 10
    },
    contactEmail: {
        type: String,
        default: ""
    },
    contactPhone: {
        type: String,
        default: ""
    }
}, { timestamps: true });

const StoreSettings = model("StoreSettings", storeSettingsSchema);

export default StoreSettings;
