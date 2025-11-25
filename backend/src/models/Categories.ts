import { model, Schema  } from "mongoose";
import { ICategory } from "../utils/interface";

const CategoriesSchema = new Schema<ICategory>({
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
    description: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const Categories = model<ICategory>("Categories", CategoriesSchema);

export default Categories;