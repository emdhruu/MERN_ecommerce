import { createProduct, deleteProductById, getAllProducts, getFeaturedProducts, getProductById, updateFeaturedStatusById, updateProductById, updateProductStockById } from "../controllers/product.controller";
import { isAdmin } from "../middleware/isAdmin";
import { createRouter } from "../utils/createRouter";

const router = createRouter();

// Only Admin can create, update, delete products

router.post("/create", isAdmin, createProduct);

router.put("/update/:id", isAdmin, updateProductById);

router.delete("/deleteById/:id", isAdmin, deleteProductById);

router.put("/updateStock/:id", isAdmin, updateProductStockById);

router.put("/updateFeaturedStatus/:id", isAdmin, updateFeaturedStatusById);

// Anyone can get products info

router.get("/getAll", getAllProducts);

router.get("/getById/:id", getProductById);

router.get("/getFeatured", getFeaturedProducts);

export default router;