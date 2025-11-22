import mongoose, { model } from "mongoose";

const { Schema } = mongoose;

interface IReview {
    product: mongoose.Types.ObjectId;
    user?: mongoose.Types.ObjectId;
    rating: number;
    comment: string[];
}

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