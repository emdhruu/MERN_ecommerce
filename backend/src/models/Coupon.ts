import mongoose, { model } from "mongoose";

const { Schema } = mongoose;

const couponSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true,
    },
    discountValue: {
        type: Number,
        required: true,
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
        required: true,
    },
    validUntil: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    usageLimit: {
        type: Number,
        default: 0, // 0 = unlimited
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
    userLimit:{
        type: Number,
        default: 1,
    },
}, { timestamps: true });

const Coupon = model("Coupon", couponSchema);

export default Coupon;