import { adjustStock, consumeStock, getAllInventory, getInventoryByProduct, getLowStockAlerts, releaseStock, reserveStock } from "../controllers/inventory.controller";
import { isAdmin } from "../middleware/isAdmin";
import { verifyingAccessToken } from "../middleware/verifyingAccessToken";
import { createRouter } from "../utils/createRouter";

const router = createRouter();

// All inventory routes require admin access

router.get("/getAll", verifyingAccessToken, isAdmin, getAllInventory);

router.get("/lowStock", verifyingAccessToken, isAdmin, getLowStockAlerts);

router.get("/getByProduct/:productId", verifyingAccessToken, isAdmin, getInventoryByProduct);

router.post("/reserve", verifyingAccessToken, isAdmin, reserveStock);

router.post("/release", verifyingAccessToken, isAdmin, releaseStock);

router.post("/consume", verifyingAccessToken, isAdmin, consumeStock);

router.post("/adjust", verifyingAccessToken, isAdmin, adjustStock);

export default router;
