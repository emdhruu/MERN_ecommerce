import mongoose, { model, Schema } from "mongoose";
import { ICoupon } from "../utils/interface";

const couponSchema = new Schema<ICoupon>({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ["cart", "category", "product"],
        required: true,
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true,
    },
    discountValue: {
        type: Number,
    },
    description: {
        type: String,
    },
    minPurchaseAmount: {
        type: mongoose.Types.Decimal128,
        default: 0,
    },
    maxDiscount: {
        type: Number,
    },
    validFrom: {
        type: Date,
    },
    validUntil: {
        type: Date,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    applicableCategories: [
        {
            type: Schema.Types.ObjectId,
            ref: "Category",
        }
    ],
    applicableProducts: [
        {
            type: Schema.Types.ObjectId,
            ref: "Product",
        }
    ],
    usageLimit: {
        type: Number,
        default: 0, // 0 = unlimited
    },
    userLimit:{
        type: Number,
        default: 1,
    },
    usedBy:[
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
            usedAt: {
                type: Date,
                default: Date.now,
            }
        }
    ],
}, { timestamps: true });

const Coupon = model<ICoupon>("Coupon", couponSchema);

export default Coupon;