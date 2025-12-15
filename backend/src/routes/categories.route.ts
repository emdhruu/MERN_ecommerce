import { createCategory, deleteCategory, getAllCategory, getCategoryById, isActiveUpdate, updateCategory } from "../controllers/category.controller";
import { isAdmin } from "../middleware/isAdmin";
import { createRouter } from "../utils/createRouter";

const router = createRouter();

// a public access - User , Admin

router.get("/getAll", getAllCategory);

router.get("/getById", getCategoryById);

// this is only accessible to Admin Role

router.post("/create", isAdmin, createCategory);

router.put("/update", isAdmin, updateCategory);

router.delete("/delete", isAdmin, deleteCategory);

router.put("/isActiveUpdate", isAdmin, isActiveUpdate);

export default router;