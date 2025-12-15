import { Request, Response } from "express";
import Coupon from "../models/Coupon";
import Categories from "../models/Categories";
import Product from "../models/Product";

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

export {
    createCoupon,
    getAllCoupons,
    toggleCouponStatus
}