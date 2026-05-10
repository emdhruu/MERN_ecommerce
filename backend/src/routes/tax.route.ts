import { createTax, getAllTaxes, updateTax, deleteTax, toggleTaxStatus } from "../controllers/tax.controller";
import { isAdmin } from "../middleware/isAdmin";
import { verifyingAccessToken } from "../middleware/verifyingAccessToken";
import { createRouter } from "../utils/createRouter";

const router = createRouter();

router.post("/create", verifyingAccessToken, isAdmin, createTax);

router.get("/all", verifyingAccessToken, isAdmin, getAllTaxes);

router.put("/update", verifyingAccessToken, isAdmin, updateTax);

router.delete("/delete", verifyingAccessToken, isAdmin, deleteTax);

router.post("/toggle-status", verifyingAccessToken, isAdmin, toggleTaxStatus);

export default router;
