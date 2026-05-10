import { model, Schema } from "mongoose";

const chargeSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ["fixed", "percentage"],
        default: "fixed",
    },
    amount: {
        type: Number,
        required: true,
    },
    applicableTo: {
        type: String,
        enum: ["all", "selective"],
        default: "all",
    },
    applicableProducts: [
        {
            type: Schema.Types.ObjectId,
            ref: "Product",
        }
    ],
    applicableCategories: [
        {
            type: Schema.Types.ObjectId,
            ref: "Categories",
        }
    ],
    minOrderAmount: {
        type: Number,
        default: null,
    },
    maxOrderAmount: {
        type: Number,
        default: null,
    },
    maxAmount: {
        type: Number,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const Charge = model("Charge", chargeSchema);

export default Charge;
