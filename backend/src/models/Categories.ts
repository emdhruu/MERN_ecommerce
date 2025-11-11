import mongoose, { Document, model } from "mongoose";
const { Schema } = mongoose;


export interface ICategory extends Document {
    name: string;
    slug: string;
    description: string;
    imageUrl? : string;
    isActive: boolean;
}

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