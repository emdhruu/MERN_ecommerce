import { Request, Response } from "express";
import Order from "../models/Order";
import Inventory from "../models/Inventory";
import Product from "../models/Product";

/**
 * Dashboard stats — revenue, orders count, inventory alerts.
 */
const getDashboardStats = async (req: Request, res: Response) => {
    try {
        // Total revenue from confirmed/delivered orders
        const revenueResult = await Order.aggregate([
            {
                $match: {
                    orderStatus: { $in: ["CONFIRMED", "DELIVERED"] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: { $toDouble: "$totalAmount" } },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);

        // Orders by status
        const ordersByStatus = await Order.aggregate([
            {
                $group: {
                    _id: "$orderStatus",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Low stock count
        const lowStockCount = await Inventory.countDocuments({
            $expr: { $lte: ["$availableStock", "$lowStockThreshold"] }
        });

        // Total products
        const totalProducts = await Product.countDocuments({ isDeleted: false });

        // Pending orders count
        const pendingOrders = await Order.countDocuments({
            orderStatus: { $in: ["PENDING", "PAYMENT_PENDING"] }
        });

        const stats = {
            totalRevenue: revenueResult[0]?.totalRevenue || 0,
            totalOrders: revenueResult[0]?.totalOrders || 0,
            lowStockCount,
            totalProducts,
            pendingOrders,
            ordersByStatus
        };

        return res.status(200).json({ data: stats });

    } catch (error: any) {
        console.log("Error getting dashboard stats:", error);
        res.status(500).json({ message: "Server error, Please try again later." });
    }
};

/**
 * Revenue chart data — daily/monthly revenue.
 */
const getRevenueChart = async (req: Request, res: Response) => {
    try {
        const period = req.query.period || "daily"; // daily or monthly
        const days = Number(req.query.days) || 30;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        let groupBy: any;
        if (period === "monthly") {
            groupBy = {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" }
            };
        } else {
            groupBy = {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
                day: { $dayOfMonth: "$createdAt" }
            };
        }

        const revenueData = await Order.aggregate([
            {
                $match: {
                    orderStatus: { $in: ["CONFIRMED", "DELIVERED"] },
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: groupBy,
                    revenue: { $sum: { $toDouble: "$totalAmount" } },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
        ]);

        return res.status(200).json({ data: revenueData });

    } catch (error: any) {
        console.log("Error getting revenue chart:", error);
        res.status(500).json({ message: "Server error, Please try again later." });
    }
};

/**
 * Top selling products.
 */
const getTopProducts = async (req: Request, res: Response) => {
    try {
        const limit = Number(req.query.limit) || 10;

        const topProducts = await Order.aggregate([
            {
                $match: {
                    orderStatus: { $in: ["CONFIRMED", "DELIVERED"] }
                }
            },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product",
                    totalSold: { $sum: "$items.quantity" },
                    totalRevenue: { $sum: { $multiply: [{ $toDouble: "$items.price" }, "$items.quantity"] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" },
            {
                $project: {
                    _id: 1,
                    totalSold: 1,
                    totalRevenue: 1,
                    "product.name": 1,
                    "product.images": 1,
                    "product.thumbnail": 1,
                    "product.price": 1
                }
            }
        ]);

        return res.status(200).json({ data: topProducts });

    } catch (error: any) {
        console.log("Error getting top products:", error);
        res.status(500).json({ message: "Server error, Please try again later." });
    }
};

/**
 * Sales stats — today, this week, this month.
 */
const getSalesStats = async (req: Request, res: Response) => {
    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(todayStart);
        weekStart.setDate(weekStart.getDate() - 7);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const matchConfirmed = { orderStatus: { $in: ["CONFIRMED", "DELIVERED"] } };

        const [todayStats, weekStats, monthStats] = await Promise.all([
            Order.aggregate([
                { $match: { ...matchConfirmed, createdAt: { $gte: todayStart } } },
                { $group: { _id: null, revenue: { $sum: { $toDouble: "$totalAmount" } }, orders: { $sum: 1 } } }
            ]),
            Order.aggregate([
                { $match: { ...matchConfirmed, createdAt: { $gte: weekStart } } },
                { $group: { _id: null, revenue: { $sum: { $toDouble: "$totalAmount" } }, orders: { $sum: 1 } } }
            ]),
            Order.aggregate([
                { $match: { ...matchConfirmed, createdAt: { $gte: monthStart } } },
                { $group: { _id: null, revenue: { $sum: { $toDouble: "$totalAmount" } }, orders: { $sum: 1 } } }
            ])
        ]);

        return res.status(200).json({
            data: {
                today: { revenue: todayStats[0]?.revenue || 0, orders: todayStats[0]?.orders || 0 },
                thisWeek: { revenue: weekStats[0]?.revenue || 0, orders: weekStats[0]?.orders || 0 },
                thisMonth: { revenue: monthStats[0]?.revenue || 0, orders: monthStats[0]?.orders || 0 }
            }
        });

    } catch (error: any) {
        console.log("Error getting sales stats:", error);
        res.status(500).json({ message: "Server error, Please try again later." });
    }
};

export { getDashboardStats, getRevenueChart, getTopProducts, getSalesStats };
