import { deleteByIdUser, getAllUsers, getByIdUser, updateByIdUser } from "../controllers/user.cotroller";
import { isAdmin } from "../middleware/isAdmin";
import { createRouter } from "../utils/createRouter";

const router = createRouter();

router.get("/usersList", isAdmin, getAllUsers);

router.delete("/deleteUser/:id", isAdmin, deleteByIdUser);

router.get("getUser/:id", getByIdUser);

router.put("updateUser/:id", updateByIdUser);

export default router;