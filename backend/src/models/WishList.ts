import mongoose, { Document, model } from "mongoose";

const { Schema } = mongoose;

interface IWishList extends Document {
    user: mongoose.Types.ObjectId;
    products: mongoose.Types.ObjectId[];
    note?: string;
}

const wishListSchema = new Schema<IWishList>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    products: [
        {
            type: Schema.Types.ObjectId,
            ref: "Product",
        }
    ],
    note: {
        type: String,
    }
}, { timestamps: true });

const WishList = model("WishList", wishListSchema);

export default WishList;