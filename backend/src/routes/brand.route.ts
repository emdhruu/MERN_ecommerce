import { createBrand, deleteBrandById, getAllBrands, getBrandBySlug, updateBrand } from "../controllers/brands.controller";
import { isAdmin } from "../middleware/isAdmin";

const express = require('express');

const router = express.Router();

// Only Admin can create, update, delete brands
router.post('/create', isAdmin, createBrand);

router.get('/all', getAllBrands);

router.get('/:slug', getBrandBySlug);

router.put('/update/:id', isAdmin, updateBrand);

router.delete('/delete/:id', isAdmin, deleteBrandById);

export default router;