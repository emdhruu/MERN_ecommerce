import { model, Schema } from "mongoose";
import { ICart } from "../utils/interface";

const cartItemSchema = new Schema<ICart>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                default: 1,
            }
        }
    ]
}, { timestamps: true });

const Cart = model<ICart>("Cart", cartItemSchema);

export default Cart;