import { cancelOrder, confirmPayment, createOrder, getAllOrders, getMyOrders, getOrderById, markDelivered, paymentFailed } from "../controllers/order.controller";
import { isAdmin } from "../middleware/isAdmin";
import { verifyingAccessToken } from "../middleware/verifyingAccessToken";
import { createRouter } from "../utils/createRouter";

const router = createRouter();

// User routes
router.post("/create", verifyingAccessToken, createOrder);

router.get("/myOrders", verifyingAccessToken, getMyOrders);

router.get("/getById/:orderId", verifyingAccessToken, getOrderById);

router.put("/cancel/:orderId", verifyingAccessToken, cancelOrder);

// Payment routes (webhook-ready)
router.put("/confirmPayment/:orderId", verifyingAccessToken, confirmPayment);

router.put("/paymentFailed/:orderId", verifyingAccessToken, paymentFailed);

// Admin routes
router.get("/getAll", verifyingAccessToken, isAdmin, getAllOrders);

router.put("/markDelivered/:orderId", verifyingAccessToken, isAdmin, markDelivered);

export default router;
