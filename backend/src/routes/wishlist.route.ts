import { addToWishlist, deleteByUserId, getByUserId, updateByUserId } from "../controllers/wishlist.controller";
import { createRouter } from "../utils/createRouter";

const router = createRouter();

router.post("/addToWishlist", addToWishlist);

router.put("/updateByUserId", updateByUserId);

router.delete("/deleteByUserId", deleteByUserId);

router.get("/getByUserId", getByUserId);

export default router;