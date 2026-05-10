import { model, Schema, Types } from "mongoose";

const grnSchema = new Schema({
    purchaseOrderId: {
        type: Types.ObjectId,
        ref: "PurchaseOrder",
        required: true
    },
    items: [
        {
            productId: {
                type: Types.ObjectId,
                ref: "Product",
                required: true
            },
            receivedQty: {
                type: Number,
                required: true
            }
        }
    ],
    note: {
        type: String
    }
}, { timestamps: true });

grnSchema.index({ purchaseOrderId: 1 });

const Grn = model("Grn", grnSchema);

export default Grn;
