import { createProduct, deleteProductById, getAllProducts, getFeaturedProducts, getProductById, updateFeaturedStatusById, updateProductById, updateProductStockById } from "../controllers/product.controller";
import { isAdmin } from "../middleware/isAdmin";
import { verifyingAccessToken } from "../middleware/verifyingAccessToken";
import { createRouter } from "../utils/createRouter";

const router = createRouter();

// Only Admin can create, update, delete products

router.post("/create", verifyingAccessToken, isAdmin, createProduct);

router.put("/update/:id",verifyingAccessToken, isAdmin, updateProductById);

router.delete("/deleteById/:id", verifyingAccessToken, isAdmin, deleteProductById);

router.put("/updateStock/:id", verifyingAccessToken, isAdmin, updateProductStockById);

router.put("/updateFeaturedStatus/:id", verifyingAccessToken, isAdmin, updateFeaturedStatusById);

// Anyone can get products info

router.get("/getAll", getAllProducts);

router.get("/getById/:id", getProductById);

router.get("/getFeatured", getFeaturedProducts);

export default router;