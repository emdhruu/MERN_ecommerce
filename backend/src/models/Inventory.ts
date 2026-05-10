import { model, Schema, Types } from "mongoose";

const inventorySchema = new Schema({
    productId: {
        type: Types.ObjectId,
        ref: "Product",
        required: true,
        unique: true
    },
    availableStock: {
        type: Number,
        required: true,
        default: 0
    },
    reservedStock: {
        type: Number,
        required: true,
        default: 0
    },
    totalStock: {
        type: Number,
        required: true,
        default: 0
    },
    lowStockThreshold: {
        type: Number,
        default: 10
    }
}, { timestamps: true });

// Index for low stock queries
inventorySchema.index({ availableStock: 1, lowStockThreshold: 1 });

const Inventory = model("Inventory", inventorySchema);

export default Inventory;
