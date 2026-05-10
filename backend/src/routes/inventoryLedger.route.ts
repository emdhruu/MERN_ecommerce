import { getAllLedgerEntries, getLedgerByProduct } from "../controllers/inventoryLedger.controller";
import { isAdmin } from "../middleware/isAdmin";
import { verifyingAccessToken } from "../middleware/verifyingAccessToken";
import { createRouter } from "../utils/createRouter";

const router = createRouter();

router.get("/getAll", verifyingAccessToken, isAdmin, getAllLedgerEntries);

router.get("/getByProduct/:productId", verifyingAccessToken, isAdmin, getLedgerByProduct);

export default router;
