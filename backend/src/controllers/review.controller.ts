import { Request, Response } from "express";
import Review from "../models/Review";

const addRatingToReview = async (req: Request, res: Response) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user?.id;

        if (!productId || !rating) {
            return res.status(400).json({ message : "Product ID and rating are required." });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message : "Rating must be between 1 and 5." });
        }

        const existingReview = await Review.findOne({ product: productId , user: userId }).exec();

        if (existingReview) {
            existingReview.rating = rating;
            if (comment) {
                existingReview.comment.push(comment);
            }
            await existingReview.save();
            return res.status(200).json({ message: "Review updated successfully.", data: existingReview });
        }

        const newReview = await Review.create({
            product: productId,
            user: userId,
            rating,
            comment
        });

        res.status(201).json({ message: "Review added successfully.", data: newReview });
        
    } catch (error) {
        res.status(500).json({ message : "Server Error, Please try again later." });
    }
}

const getReviewsByProduct = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({ message : "Product Id is required." });
        }

        let skip : number = 0;
        let limit : number = 0;

        if (req.query.page && req.query.limit) {
            const page : number = parseInt(req.query.page as string);
            const pageSize : number = parseInt(req.query.limit as string);

            skip = pageSize * (page - 1);
            limit = pageSize;
        }

        const totalReviews = await Review.find({ product: productId }).countDocuments().exec();

        const reviews = await Review.find({ product: productId }).skip(skip).limit(limit).populate('user').exec();

        res.set('X-Total-Count', totalReviews.toString());
        res.status(200).json({data: reviews})

    } catch (error) {
        res.status(500).json({ message : "Server Error, Please try again later." });
    }
}

const deleteReview = async (req: Request, res: Response) => {
    try {
        const { reviewId } = req.body;

        if (!reviewId) {
            return res.status(400).json({ message : "Review Id is required." });
        }

        await Review.findByIdAndDelete(reviewId);

        res.status(200).json({ message : "Review deleted successfully." });
    } catch (error) {
        res.status(500).json({ message : "Server Error, Please try again later." });
    }
}

const getAllReviews = async (req: Request, res: Response) => {
    try {
        const reviews = await Review.find().populate({ path: 'user', select: "-password" }).populate('product');
        res.status(200).json({ data: reviews });
    } catch (error) {
        res.status(500).json({ message : "Server Error, Please try again later." });
    }
}

export {
    addRatingToReview,
    getReviewsByProduct,
    deleteReview,
    getAllReviews
}