import mongoose, { model } from "mongoose";

const { Schema } = mongoose;

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
        }
    ],
    address: {
        type: Schema.Types.ObjectId,
        ref: "Address",
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'paypal', 'cash_on_delivery'],
        required: true,
    },
    payementStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
    },
    totalAmount: {
        type: mongoose.Types.Decimal128,
        required: true,
    },
    orderStatus: {
        type: String,
        enum: ['processing', 'shipped', 'delivered', 'cancelled'],
        default: 'processing',
    }
}, { timestamps: true });

const Order = model("Order", orderSchema);

export default Order;