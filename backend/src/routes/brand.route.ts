import { createBrand, deleteBrandById, getAllBrands, getBrandBySlug, updateBrand } from "../controllers/brands.controller";
import { isAdmin } from "../middleware/isAdmin";
import { createRouter } from "../utils/createRouter";

const router = createRouter();

// Only Admin can create, update, delete brands

router.post('/create', isAdmin, createBrand);

router.put('/update/:id', isAdmin, updateBrand);

router.delete('/delete/:id', isAdmin, deleteBrandById);

// Anyone can get brands info

router.get('/all', getAllBrands);

router.get('/:slug', getBrandBySlug);

export default router;