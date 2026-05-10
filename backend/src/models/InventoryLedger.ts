import { model, Schema, Types } from "mongoose";

const inventoryLedgerSchema = new Schema({
    productId: {
        type: Types.ObjectId,
        ref: "Product",
        required: true,
    },
    type: {
        type: String,
        enum: ["IN", "RESERVE", "OUT", "RELEASE", "ADJUST"],
        required: true,
    },
    quantity: {
        type: Number,
        required: true
    },
    reference: {
        type: String,
        enum: ["ORDER", "PURCHASE", "SYSTEM", "ADMIN"],
        required: true
    },
    referenceId: {
        type: Types.ObjectId,
        default: null
    },
    note: {
        type: String
    }
}, { timestamps: true });

inventoryLedgerSchema.index({ productId: 1, createdAt: -1 });
inventoryLedgerSchema.index({ type: 1 });
inventoryLedgerSchema.index({ reference: 1, referenceId: 1 });

const InventoryLedger = model("InventoryLedger", inventoryLedgerSchema);

export default InventoryLedger;
