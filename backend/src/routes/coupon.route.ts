import { applyCoupon, couponUsedByUserUpdation, createCoupon, deleteCoupon, getAllCoupons, toggleCouponStatus, updateCoupon } from "../controllers/coupon.controller";
import { isAdmin } from "../middleware/isAdmin";
import { verifyingAccessToken } from "../middleware/verifyingAccessToken";
import { createRouter } from "../utils/createRouter";

const router = createRouter();

router.post("/create", verifyingAccessToken,  isAdmin, createCoupon);

router.get("/all", getAllCoupons);

router.post("/toggle-status", verifyingAccessToken, isAdmin, toggleCouponStatus);

router.put("/updateCoupon", verifyingAccessToken, isAdmin, updateCoupon );

router.delete("/deleteCoupon", verifyingAccessToken, isAdmin, deleteCoupon );

router.post("/apply-coupon", verifyingAccessToken, applyCoupon );

router.post("/coupon-used-by-user-update", couponUsedByUserUpdation );

export default router;