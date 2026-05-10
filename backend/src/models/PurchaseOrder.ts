import { model, Schema, Types } from "mongoose";

const purchaseOrderSchema = new Schema({
    supplierName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["PENDING", "PARTIAL", "COMPLETED"],
        default: "PENDING"
    },
    items: [
        {
            productId: {
                type: Types.ObjectId,
                ref: "Product",
                required: true
            },
            orderedQty: {
                type: Number,
                required: true
            },
            receivedQty: {
                type: Number,
                default: 0
            }
        }
    ]
}, { timestamps: true });

purchaseOrderSchema.index({ status: 1 });
purchaseOrderSchema.index({ createdAt: -1 });

const PurchaseOrder = model("PurchaseOrder", purchaseOrderSchema);

export default PurchaseOrder;
