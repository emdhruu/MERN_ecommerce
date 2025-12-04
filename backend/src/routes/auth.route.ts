import { getUserProfile, loginUser, registerUser, verifyOtp, } from "../controllers/auth.controller";
import { authenticateToken } from "../middleware/auth";
import { createRouter } from "../utils/createRouter";

const router = createRouter();

router.post("/register", registerUser);

router.post("/verifyOtp", verifyOtp);

router.post("/login", loginUser);

router.get("/profile", authenticateToken, getUserProfile);

export default router;
