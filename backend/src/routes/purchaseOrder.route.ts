import { createPurchaseOrder, getAllPurchaseOrders, getGrnsByPurchaseOrder, getPurchaseOrderById, receiveGoods } from "../controllers/inventoryInbound.controller";
import { isAdmin } from "../middleware/isAdmin";
import { verifyingAccessToken } from "../middleware/verifyingAccessToken";
import { createRouter } from "../utils/createRouter";

const router = createRouter();

// All purchase order routes require admin access

router.post("/create", verifyingAccessToken, isAdmin, createPurchaseOrder);

router.post("/receiveGoods", verifyingAccessToken, isAdmin, receiveGoods);

router.get("/getAll", verifyingAccessToken, isAdmin, getAllPurchaseOrders);

router.get("/getById/:id", verifyingAccessToken, isAdmin, getPurchaseOrderById);

router.get("/grn/:purchaseOrderId", verifyingAccessToken, isAdmin, getGrnsByPurchaseOrder);

export default router;
