import { Request, Response } from "express";
import Cart from "../models/Cart";
import Product from "../models/Product";

const getCart = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;

        let cart = await Cart.findOne({ user: userId }).populate({
            path: "items.product",
            select: "name price salesPrice discountPercentage images thumbnail brand inStock stock",
            populate: { path: "brand", select: "name" }
        });

        if (!cart) {
            cart = await Cart.create({ user: userId, items: [] });
        }

        res.status(200).json({ cartItems: cart });
    } catch (error) {
        res.status(500).json({ message: "Server Error, Please try again later." });
    }
};

const addToCart = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        const { productId, quantity } = req.body;

        if (!productId) return res.status(400).json({ message: "Product ID is required." });

        const product = await Product.findById(productId);
        if (!product || product.isDeleted) return res.status(404).json({ message: "Product not found." });

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({
                user: userId,
                items: [{ product: productId, quantity: quantity || 1 }]
            });
        } else {
            const existingItem = cart.items.find(
                (item) => item.product.toString() === productId
            );
            if (existingItem) {
                existingItem.quantity += quantity || 1;
            } else {
                cart.items.push({ product: productId, quantity: quantity || 1 });
            }
        }

        await cart.save();
        res.status(200).json({ message: "Product added to cart successfully.", cartItem: cart });

    } catch (error) {
        res.status(500).json({ message: "Server Error, Please try again later." });
    }
};

const updateCartQuantity = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        const { productId, quantity } = req.body;

        if (!productId || quantity == null) {
            return res.status(400).json({ message: "Product ID and quantity are required." });
        }

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found." });
        }

        if (quantity <= 0) {
            // Remove item from cart
            cart.items = cart.items.filter(
                (item) => item.product.toString() !== productId
            );
        } else {
            const item = cart.items.find(
                (item) => item.product.toString() === productId
            );
            if (!item) {
                return res.status(404).json({ message: "Product not found in cart." });
            }
            item.quantity = quantity;
        }

        await cart.save();
        return res.status(200).json({ message: "Cart updated.", cart });

    } catch (error) {
        res.status(500).json({ message: "Server Error, Please try again later." });
    }
};

const clearCartItems = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found." });
        }

        cart.items = [];
        await cart.save();

        return res.status(200).json({ message: "Cart cleared successfully.", cart });

    } catch (error) {
        res.status(500).json({ message: "Server Error, Please try again later." });
    }
};

export { getCart, addToCart, updateCartQuantity, clearCartItems };
