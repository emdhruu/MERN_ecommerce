import mongoose, { model, Schema } from "mongoose";

const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                default: 1,
            },
            price: {
                type: mongoose.Types.Decimal128,
                required: true,
            }
        }
    ],
    address: {
        type: Schema.Types.ObjectId,
        ref: "Address",
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ["credit_card", "paypal", "cash_on_delivery", "razorpay"],
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
    },
    transactionId: {
        type: String,
        default: null
    },
    totalAmount: {
        type: mongoose.Types.Decimal128,
        required: true,
    },
    subtotal: {
        type: mongoose.Types.Decimal128,
        default: 0,
    },
    couponCode: {
        type: String,
        default: null,
    },
    discount: {
        type: mongoose.Types.Decimal128,
        default: 0,
    },
    orderStatus: {
        type: String,
        enum: ["PENDING", "PAYMENT_PENDING", "CONFIRMED", "CANCELLED", "FAILED", "DELIVERED"],
        default: "PENDING",
    }
}, { timestamps: true });

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });

const Order = model("Order", orderSchema);

export default Order;
