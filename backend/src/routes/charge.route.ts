import { createCharge, getAllCharges, updateCharge, deleteCharge, toggleChargeStatus } from "../controllers/charge.controller";
import { isAdmin } from "../middleware/isAdmin";
import { verifyingAccessToken } from "../middleware/verifyingAccessToken";
import { createRouter } from "../utils/createRouter";

const router = createRouter();

router.post("/create", verifyingAccessToken, isAdmin, createCharge);

router.get("/all", verifyingAccessToken, isAdmin, getAllCharges);

router.put("/update", verifyingAccessToken, isAdmin, updateCharge);

router.delete("/delete", verifyingAccessToken, isAdmin, deleteCharge);

router.post("/toggle-status", verifyingAccessToken, isAdmin, toggleChargeStatus);

export default router;
