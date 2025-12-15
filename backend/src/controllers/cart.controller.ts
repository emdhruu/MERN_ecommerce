import { Request, Response } from "express";
import Cart from "../models/Cart";
import Product from "../models/Product";

const getCart = async (req : Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const cartItems = await Cart.find({ userId }).populate({
            path: "product",
            populate: { path: "brand", select: "name logoUrl" }
        });

        res.status(200).json({ cartItems });
    } catch (error) {
        res.status(500).json({ message : "Server Error, Please try again later." });
    }
}

const addToCart = async (req : Request, res : Response) => {
    try {
        const userId = req.user?.id;
        const { productId, quantity } = req.body;

        if (!productId) return res.status(400).json({ message : "Prodcut ID is required." });

        const product = await Product.findById(productId);
        if (!product || product.isDeleted) return res.status(404).json({ message : "Product not found." });

        let cartItem = await Cart.findOne({ user: userId });
        if(!cartItem){
            cartItem = new Cart({
                user: userId,
                items: [{ product: productId, quantity: quantity || 1}]
            })
        } else {
            const items = cartItem?.items.find(item => item.product._id === productId);
            if(items){
                items.quantity += quantity || 1;
            } else {
                cartItem.items.push({ product: productId, quantity: quantity || 1});
            }
        }

        await cartItem.save();
        res.status(200).json({ message : "Product added to cart successfully.", cartItem });

    } catch (error) {
        res.status(500).json({ message : "Server Error, Please try again later." });
    }
}

const updateCartQuantity = async (req : Request , res : Response) => {
    try {
        const userId = req.user?._id;
        const { productId , quantity } = req.body;

        if (!productId || quantity == null){
            return res.status(400).json({ message: "Product-Id and quantity are required" });
        }

        const cart = await Cart.findOne({ user: userId });

        if(!cart){
            return res.status(400).json({ message : "Cart not found" });
        }

        const item = cart.items.find(idx => idx.product._id === productId);
        if(!item){
            return res.status(400).json({ message : "No product found in cart!" });
        }

        item.quantity = quantity

        if(item.quantity <= 0){
            cart.items = cart.items.filter(i => i.product._id !== productId);
        }

        await cart.save()

        return res.status(200).json({ message : "Cart updated", cart });

    } catch (error) {
        res.status(500).json({ message : "Server Error, Please try again later." });
    }
}

const clearCartItems = async (req : Request , res : Response) => {
    try {
        const userId = req.user?.id;

        const cart = await Cart.findOne({user : userId });

        if(!cart){
            return res.status(400).json({ message : "Cart not found" });
        }

        cart.items = [];
        await cart.save();

        return res.status(200).json({ message : "Cart items deleted successfully." , cart});
        
    } catch (error) {
        res.status(500).json({ message : "Server Error, Please try again later." });
    }
}

export {getCart, addToCart, updateCartQuantity, clearCartItems};