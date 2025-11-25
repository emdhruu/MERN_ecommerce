import mongoose, { model, Schema } from "mongoose";
import { IProduct } from "../utils/interface";

const productSchema = new Schema<IProduct>({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: mongoose.Types.Decimal128,
        required: true,
    },
    salesPrice: {
        type: mongoose.Types.Decimal128,
        default: null,
    },
    discountPercentage: {
        type: Number,
        default: 0,
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    brand: {
        type: Schema.Types.ObjectId,
        ref: "Brand",
        required: true,
    },
    inStock: {
        type: Boolean,
        default: true,
        required: true,
    },
    images: {
        type: [String],
        default: [],
        required: true,
    },
    thumbnail: {
        type: String,
    },
    stock: {
        type: Number,
        default: 0,
        required: true,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const Product = model<IProduct>("Product", productSchema);

export default Product;