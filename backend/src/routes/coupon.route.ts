import { applyCoupon, couponUsedByUserUpdation, createCoupon, getAllCoupons, toggleCouponStatus, updateCoupon } from "../controllers/coupon.controller";
import { isAdmin } from "../middleware/isAdmin";
import { createRouter } from "../utils/createRouter";

const router = createRouter();

router.post("/create", isAdmin, createCoupon);

router.get("/all", getAllCoupons);

router.post("/toggle-status", isAdmin, toggleCouponStatus);

router.put("/updateCoupon", isAdmin, updateCoupon );

router.delete("/deleteCoupon", isAdmin, updateCoupon );

router.post("/apply-coupon", applyCoupon );

router.post("/coupon-used-by-user-update", couponUsedByUserUpdation );

export default router;