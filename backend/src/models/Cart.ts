import mongoose, { model } from "mongoose";

const { Schema } = mongoose;

interface ICartItem {
    product: mongoose.Types.ObjectId;
    quantity: number;
}

interface ICart {
    user: mongoose.Types.ObjectId;
    items: ICartItem[];
}

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