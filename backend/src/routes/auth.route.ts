import { getUserProfile, handleRefreshToken, loginUser, logoutUser, registerUser, resendOtp, verifyOtp, } from "../controllers/auth.controller";
import { verifyingAccessToken } from "../middleware/verifyingAccessToken";
import { createRouter } from "../utils/createRouter";

const router = createRouter();

router.post("/register", registerUser);

router.post("/verifyOtp", verifyOtp);

router.post("/login", loginUser);

router.get("/profile", verifyingAccessToken, getUserProfile);

router.post("/resendOtp", resendOtp );

router.post("/logout", verifyingAccessToken, logoutUser );

router.post("/refresh", handleRefreshToken);

export default router;
