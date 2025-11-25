import {Schema , model } from "mongoose";
import { IBrand } from "../utils/interface";

const brandSchema = new Schema<IBrand>({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    logoUrl: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

const Brand = model("Brand", brandSchema);

export default Brand;