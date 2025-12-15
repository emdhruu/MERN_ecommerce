import { addToCart, clearCartItems, getCart, updateCartQuantity } from "../controllers/cart.controller";
import { createRouter } from "../utils/createRouter";

const router = createRouter();

router.get("/getCart", getCart);

router.post("/addToCart", addToCart);

router.put("/updateQuantity", updateCartQuantity);

router.delete("/deleteCartItems", clearCartItems);

export default router;