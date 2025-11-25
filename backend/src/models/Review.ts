import { model, Schema } from "mongoose";
import { IReview } from "../utils/interface";

const reviewSchema = new Schema<IReview>({
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        default: 0
    },
    comment: {
        type: [String],
        default: []
    },
}, { timestamps: true });

const Review = model<IReview>("Review", reviewSchema);

export default Review;