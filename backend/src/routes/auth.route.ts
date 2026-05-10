import { changePassword, getUserProfile, handleRefreshToken, loginUser, logoutUser, registerUser, resendOtp, updateProfile, verifyOtp, } from "../controllers/auth.controller";
import { verifyingAccessToken } from "../middleware/verifyingAccessToken";
import { createRouter } from "../utils/createRouter";

const router = createRouter();

router.post("/register", registerUser);

router.post("/verifyOtp", verifyOtp);

router.post("/login", loginUser);

router.get("/profile", verifyingAccessToken, getUserProfile);

router.put("/updateProfile", verifyingAccessToken, updateProfile);

router.put("/changePassword", verifyingAccessToken, changePassword);

router.post("/resendOtp", resendOtp );

router.post("/logout", logoutUser );

router.post("/refresh", handleRefreshToken);

export default router;
