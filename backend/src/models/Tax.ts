import { model, Schema } from "mongoose";

const taxSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    rate: {
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
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const Tax = model("Tax", taxSchema);

export default Tax;
