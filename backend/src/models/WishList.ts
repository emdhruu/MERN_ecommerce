import { model, Schema } from "mongoose";
import { IWishList } from "../utils/interface";

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

const WishList = model<IWishList>("WishList", wishListSchema);

export default WishList;