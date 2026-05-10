import { getNotificationPreferences, getStoreSettings, updateNotificationPreferences, updateStoreSettings } from "../controllers/settings.controller";
import { isAdmin } from "../middleware/isAdmin";
import { verifyingAccessToken } from "../middleware/verifyingAccessToken";
import { createRouter } from "../utils/createRouter";

const router = createRouter();

// Store settings — admin only
router.get("/store", verifyingAccessToken, isAdmin, getStoreSettings);

router.put("/store", verifyingAccessToken, isAdmin, updateStoreSettings);

// Notification preferences — per user (admin)
router.get("/notifications", verifyingAccessToken, getNotificationPreferences);

router.put("/notifications", verifyingAccessToken, updateNotificationPreferences);

export default router;
