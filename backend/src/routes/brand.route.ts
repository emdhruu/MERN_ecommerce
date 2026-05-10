import { createBrand, deleteBrandById, getAllBrands, getBrandBySlug, updateBrand } from "../controllers/brands.controller";
import { isAdmin } from "../middleware/isAdmin";
import { verifyingAccessToken } from "../middleware/verifyingAccessToken";
import { createRouter } from "../utils/createRouter";

const router = createRouter();

// Only Admin can create, update, delete brands

router.post('/create',verifyingAccessToken, isAdmin, createBrand);

router.put('/update/:id', verifyingAccessToken, isAdmin, updateBrand);

router.delete('/delete/:id', verifyingAccessToken, isAdmin, deleteBrandById);

// Anyone can get brands info

router.get('/all', getAllBrands);

router.get('/:slug', getBrandBySlug);

export default router;