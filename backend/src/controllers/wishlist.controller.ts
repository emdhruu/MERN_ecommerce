import { Request, Response } from "express";
import WishList from "../models/WishList";

const addToWishlist = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { productId , note } = req.body;
        
        if (!userId){
            return res.status(400).json({ message : "User ID is required." });
        }
        const createdWishlist = await WishList.create({ userId, products: [productId], note });
        return  res.status(201).json({ message: "Product added to wishlist", wishlist: createdWishlist });

    } catch (error) {
        res.status(500).json({ message : "Server Error, Please try again later." });
    }
}

const updateByUserId = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { productId , note } = req.body;
        
        if (!userId){
            return res.status(400).json({ message : "User ID is required." });
        }

    const updatedList = await WishList.findOneAndUpdate({ userId }, { products: [productId], note }, { new: true }).populate("products");

    res.status(200).json({ message: "Wishlist updated", wishlist: updatedList });
        
    } catch (error) {
        res.status(500).json({ message : "Server Error, Please try again later." });
    }
}

const deleteByUserId = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId){
            return res.status(400).json({ message : "User ID is required." });
        }

        await WishList.findOneAndDelete({ userId });

        res.status(200).json({ message: "Wishlist deleted successfully" });
    } catch (error) {
        res.status(500).json({ message : "Server Error, Please try again later." });
    }
}

const getByUserId = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        
        if (!userId){
            return res.status(400).json({ message : "User ID is required." });
        }

        let skip = 0;
        let limit = 0;

        if (req.params.page && req.params.limit ) {
            const page  = req.params.page  ? parseInt(req.params.page)  : 1;
            limit = req.params.limit ? parseInt(req.params.limit) : 10;
            skip  = (page - 1) * limit;
        }

        const result = await WishList.findOne({ userId }).skip(skip).limit(limit).populate({path: "products", populate: { path: "brands" }});
        const totalResults = await WishList.find({ userId }).countDocuments().exec();

        res.set('X-Total-Count', totalResults.toString());
        res.status(200).json({ wishlist: result });
    } catch (error) {
        res.status(500).json({ message : "Server Error, Please try again later." });
    }
}

export {
    addToWishlist,
    updateByUserId,
    deleteByUserId,
    getByUserId
}