import { Request, Response } from "express";
import Coupon from "../models/Coupon";
import Categories from "../models/Categories";
import Product from "../models/Product";
import Cart from "../models/Cart";

const createCoupon = async (req: Request, res: Response) => {
    try {
        const {
            code,
            type,
            discountType,
            discountValue,
            minPurchaseAmount,
            maxDiscount,
            validFrom,
            validUntil,
            isActive,
            applicableCategories,
            applicableProducts,
            userLimit,
            usageLimit,
            usedBy,
            description
        } = req.body;

        const existng = await Coupon.findOne({ code: code.toUpperCase() });
        if (existng){
            return res.status(400).json({ message : "Coupon code already exists." });
        }

        if (discountType === "percentage"){
            if (discountValue <= 0 || discountValue > 100){
                return res.status(400).json({ message : "Percentage discount must be between 1 to 100." });
            }
            if (!maxDiscount){
                return res.status(400).json({ message : "Max discount is required for percentage coupons." })
            }
        }

        if (new Date(validFrom) >= new Date(validUntil)){
            return res.status(400).json({ message : "validFrom must be earlier then validUntil." });
        }

        if(minPurchaseAmount && Number(minPurchaseAmount) < 0){
            return res.status(400).json({ message : "minPurchaseAmount cannot be negative." });
        }

        const isCategoryCoupon = applicableCategories?.length > 0;
        const isProductCoupon = applicableProducts?.length > 0;

        if (isCategoryCoupon && isProductCoupon){
            return res.status(400).json({ message : "Coupon cannot be apply to both categories and product." });
        }

        if (isCategoryCoupon){
            const exists = await Categories.find({ _id: { $in: applicableCategories } });
            if (exists.length !== applicableCategories){
                return res.status(400).json({ message : "One or more categories are invalid." });
            }
        }

        if (isProductCoupon){
            const exists = await Product.find({ _id: { $in: applicableProducts } });
            if (exists.length !== applicableProducts){
                return res.status(400).json({ message : "One or more categories are invalid." });
            }
        }

        const coupon = await Coupon.create({
            code,
            type,
            discountType,
            discountValue,
            description,
            minPurchaseAmount,
            maxDiscount,
            validFrom,
            validUntil,
            isActive,
            applicableCategories,
            applicableProducts,
            usageLimit,
            userLimit,
            usedBy
        })

        res.status(201).json({ data : coupon });

    } catch (error) {
        res.status(500).json({ message: "Server Error, Please try again later." });
    }
}

const getAllCoupons = async (req: Request, res: Response) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.status(200).json({ data: coupons });
    } catch (error) {
        res.status(500).json({ message: "Server Error, Please try again later." });
    }
}

const toggleCouponStatus = async (req: Request, res: Response) => {
    try {
        const couponId = req.body;
        const coupon = await Coupon.findById(couponId);
        if (!coupon){
            return res.status(404).json({ message: "Coupon not found." });
        }
        coupon.isActive = !coupon.isActive;
        await coupon.save();
        res.status(200).json({ data: coupon });
    } catch (error) {
        res.status(500).json({ message: "Server Error, Please try again later." });
    }
}

const updateCoupon = async (req: Request, res: Response) => {
    try {
        const updateCoupon = req.body;

        const coupon = await Coupon.findById({ _id: updateCoupon._id });
        if (!coupon){
            return res.status(404).json({ message: "Coupon not found." });
        }

        if (updateCoupon.validFrom && updateCoupon.validUntil && new Date(updateCoupon.validFrom) >= new Date(updateCoupon.validUntil)){
            return res.status(400).json({ message : "Invalid date range." });
        }

        if (updateCoupon.discountType === "percentage" && updateCoupon.discountValue > 100 && updateCoupon.discountValue <= 0){
            return res.status(400).json({ message : "Invalid Percentage value." });
        }

        if (updateCoupon.applicableCategories?.length && updateCoupon.applicableProducts?.length){
            return res.status(400).json({ message : "Coupon cannot be apply to both categories and product." });
        }

        Object.assign(coupon, updateCoupon);
        await coupon.save();

        res.status(200).json({ message: "Coupon updated successfully.", data: coupon });

    } catch (error) {
        res.status(500).json({ message: "Server Error, Please try again later." });
    }
}

const deleteCoupon = async (req: Request, res: Response) => {
    try {
        const couponId = req.body;
        const coupon = await Coupon.findByIdAndDelete(couponId);
        if (!coupon){
            return res.status(404).json({ message: "Coupon not found." });
        }

        res.status(200).json({ message: "Coupon deleted successfully." });

    } catch (error) {
        res.status(500).json({ message: "Server Error, Please try again later." });
    }
}

const applyCoupon = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { code } = req.body;

        if (!code){
            return res.status(400).json({ message : "Coupon code is required." });
        }

        const coupon = await Coupon.findOne({ code , isActive: true });
        if (!coupon){
            return res.status(404).json({ message: "Invalid or inactive coupon code." });
        }

        const currentDate = new Date();
        if ((coupon.validFrom && coupon.validFrom > currentDate) || (coupon.validUntil && coupon.validUntil < currentDate)){
            return res.status(400).json({ message : "Coupon is expired or not active."});
        }

        const usageLimit = typeof coupon.usageLimit === "number" ? coupon.usageLimit : 0;

        if ( usageLimit > 0 && ((coupon.usedBy ? coupon.usedBy.length : 0) >= usageLimit)
        ) {
            return res.status(400).json({ message : "Coupon usage limit exceeded." });
        }

        const userUsageCount = coupon.usedBy?.filter((u)=> u.userId.toString() === userId).length || 0;

        if ( userUsageCount >= (usageLimit)){
            return res.status(400).json({ message : "Coupon is already used by you." });
        }

        const cart = await Cart.findOne({ user: userId }).populate("items.product");
        if (!cart || cart.items.length === 0){
            return res.status(400).json({ message : "Cart is empty." });
        }

        let eligibleAmount = 0;

        if (coupon.type === "cart") {
            eligibleAmount = cart.items.reduce((sum: number, item: any) => sum + item.product.price * item.quantity, 0);
        }

        if (coupon.type === "category") {
            eligibleAmount = cart.items.reduce((sum: number, item: any) => {
                if(item.product.category && coupon.applicableCategories?.includes(item.product.category)){
                    return sum + item.product.price * item.quantity;
                }
                return sum;
            },0);
        }

        if (coupon.type === "product") {
            eligibleAmount = cart.items.reduce((sum: number, item: any) => {
                if(item.product._id && coupon.applicableProducts?.includes(item.product._id)){
                    return sum + item.product.price * item.quantity;
                }
                return sum;
            }, 0);
        }

        if (eligibleAmount === 0){
            return res.status(400).json({ message : "No eligible items in cart for this coupon." });
        }

        if (eligibleAmount < Number(coupon.minPurchaseAmount)){
            return res.status(400).json({ message : `Minimum purchase amount of ${coupon.minPurchaseAmount} is required to apply this coupon.` });
        }

        let discount = 0;

        if (coupon.discountType === "percentage"){
            discount = (eligibleAmount * coupon.discountValue) /100;
            if (coupon.maxDiscount && discount > coupon.maxDiscount){
                discount = coupon.maxDiscount;
            }
        } else if (coupon.discountType === "fixed"){
            discount = coupon.discountValue;
        }

        const totalCartAmount = cart.items.reduce((sum: number, item: any) => sum + item.product.price * item.quantity, 0);

        const finalAmount = Math.max(totalCartAmount - discount, 0);

        return res.status(200).json({
            data: {
                originalAmount: totalCartAmount,
                discountApplied: discount,
                payableValue: finalAmount,
                couponDetails: coupon
            }
        })

    } catch (error) {
        res.status(500).json({ message: "Server Error, Please try again later." });
    }
}

const couponUsedByUserUpdation = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { couponId } = req.body;

        if (!userId){
            return res.status(400).json({ message : "User ID is required." });
        }

        const coupon = await Coupon.findById(couponId);
        if (!coupon){
            return res.status(404).json({ message: "Coupon not found." });
        }

        if (coupon.usageLimit && coupon.usageLimit > 0){
         coupon.usageLimit -= 1;
        }

        coupon.usedBy.push({
            userId: userId,
            usedAt: new Date()
        })

        await coupon.save();

        return res.status(200).json({ message: "Coupon usage recorded." });

    } catch (error) {
        return res.status(500).json({ message : "Server Error, Please try again later." });
    }
}
    

export {
    createCoupon,
    getAllCoupons,
    toggleCouponStatus,
    updateCoupon,
    deleteCoupon,
    applyCoupon,
    couponUsedByUserUpdation
}