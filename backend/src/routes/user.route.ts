import express from "express";
import { deleteByIdUser, getAllUsers, getByIdUser, updateByIdUser } from "../controllers/user.cotroller";
import { isAdmin } from "../middleware/isAdmin";

const router = express.Router();

router.get("/usersList", isAdmin, getAllUsers);
router.delete("/deleteUser/:id", isAdmin, deleteByIdUser);
router.get("getUser/:id", getByIdUser);
router.put("updateUser/:id", updateByIdUser);

export default router;