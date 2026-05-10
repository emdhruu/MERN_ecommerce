import mongoose, { model, Schema, Types } from "mongoose";

const invoiceSchema = new Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ["SALES", "PURCHASE"],
        required: true
    },
    // For SALES — references an Order
    orderId: {
        type: Types.ObjectId,
        ref: "Order",
        default: null
    },
    // For PURCHASE — references a PurchaseOrder
    purchaseOrderId: {
        type: Types.ObjectId,
        ref: "PurchaseOrder",
        default: null
    },
    customer: {
        name: { type: String },
        email: { type: String }
    },
    supplier: {
        name: { type: String }
    },
    items: [
        {
            productId: {
                type: Types.ObjectId,
                ref: "Product"
            },
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            unitPrice: { type: Number, required: true },
            total: { type: Number, required: true }
        }
    ],
    subtotal: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        default: 0
    },
    taxRate: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["DRAFT", "ISSUED", "PAID", "CANCELLED"],
        default: "ISSUED"
    },
    notes: {
        type: String
    },
    issuedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

invoiceSchema.index({ type: 1, createdAt: -1 });
invoiceSchema.index({ orderId: 1 });
invoiceSchema.index({ purchaseOrderId: 1 });

const Invoice = model("Invoice", invoiceSchema);

export default Invoice;
