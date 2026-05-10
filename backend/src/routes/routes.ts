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
import inventoryRoutes from "./inventory.route";
import inventoryLedgerRoutes from "./inventoryLedger.route";
import purchaseOrderRoutes from "./purchaseOrder.route";
import dashboardRoutes from "./dashboard.route";
import settingsRoutes from "./settings.route";
import invoiceRoutes from "./invoice.route";
import taxRoutes from "./tax.route";
import chargeRoutes from "./charge.route";
import paymentRoutes from "./payment.route";
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

router.use("/inventory", inventoryRoutes);

router.use("/inventory-ledger", inventoryLedgerRoutes);

router.use("/purchase-orders", purchaseOrderRoutes);

router.use("/admin/dashboard", dashboardRoutes);

router.use("/settings", settingsRoutes);

router.use("/invoices", invoiceRoutes);

router.use("/tax", taxRoutes);

router.use("/charges", chargeRoutes);

router.use("/payment", paymentRoutes);

export default router;
