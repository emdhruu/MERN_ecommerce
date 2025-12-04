import authRoutes from "./auth.route";
import addressRoutes from "./address.route";
import productRoutes from "./product.route";
import brandRoutes from "./brand.route";
import categoriesRoutes from "./categories.route";
import couponRoutes from "./coupon.route";
import orderRoutes from "./order.route";
import reviewRoutes from "./review.route";
import cartRoutes from "./cart.route";
import wishListRoutes from "./wishlist.route";
import userRoutes from "./user.route";
import { createRouter } from "../utils/createRouter";

const router = createRouter();

router.use("/auth", authRoutes);

router.use("/address", addressRoutes);

router.use("/product", productRoutes);

router.use("/brand", brandRoutes);

router.use("/categories", categoriesRoutes);

router.use("/coupon", couponRoutes);

router.use("/order", orderRoutes);

router.use("/review", reviewRoutes);

router.use("/cart", cartRoutes);

router.use("/wishlist", wishListRoutes);

router.use("/user", userRoutes);

export default router;
