import { getDashboardStats, getRevenueChart, getSalesStats, getTopProducts } from "../controllers/dashboard.controller";
import { isAdmin } from "../middleware/isAdmin";
import { verifyingAccessToken } from "../middleware/verifyingAccessToken";
import { createRouter } from "../utils/createRouter";

const router = createRouter();

// All dashboard routes require admin access

router.get("/stats", verifyingAccessToken, isAdmin, getDashboardStats);

router.get("/revenue", verifyingAccessToken, isAdmin, getRevenueChart);

router.get("/topProducts", verifyingAccessToken, isAdmin, getTopProducts);

router.get("/salesStats", verifyingAccessToken, isAdmin, getSalesStats);

export default router;
