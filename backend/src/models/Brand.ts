import mongoose, { Document, model } from "mongoose";

const { Schema } = mongoose;

interface IBrand extends Document {
    name: string;
    slug: string;
    logoUrl?: string;
    isActive: boolean;
}

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