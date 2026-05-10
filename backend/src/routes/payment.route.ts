import { createPaymentOrder, verifyPayment } from "../controllers/payment.controller";
import { verifyingAccessToken } from "../middleware/verifyingAccessToken";
import { createRouter } from "../utils/createRouter";

const router = createRouter();

router.post("/create-order", verifyingAccessToken, createPaymentOrder);
router.post("/verify", verifyingAccessToken, verifyPayment);

export default router;