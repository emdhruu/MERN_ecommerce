import { deleteByIdUser, getAllUsers, getByIdUser, updateByIdUser } from "../controllers/user.cotroller";
import { isAdmin } from "../middleware/isAdmin";
import { verifyingAccessToken } from "../middleware/verifyingAccessToken";
import { createRouter } from "../utils/createRouter";

const router = createRouter();

router.get("/usersList", verifyingAccessToken, isAdmin, getAllUsers);

router.delete("/deleteUser/:id", verifyingAccessToken, isAdmin, deleteByIdUser);

router.get("/getUser/:id", verifyingAccessToken, getByIdUser);

router.put("/updateUser/:id", verifyingAccessToken, updateByIdUser);

export default router;