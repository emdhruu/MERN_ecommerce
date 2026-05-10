import { addToCart, clearCartItems, getCart, updateCartQuantity } from "../controllers/cart.controller";
import { verifyingAccessToken } from "../middleware/verifyingAccessToken";
import { createRouter } from "../utils/createRouter";

const router = createRouter();

router.get("/getCart", verifyingAccessToken, getCart);

router.post("/addToCart", verifyingAccessToken, addToCart);

router.put("/updateQuantity", verifyingAccessToken, updateCartQuantity);

router.delete("/deleteCartItems", verifyingAccessToken, clearCartItems);

export default router;
