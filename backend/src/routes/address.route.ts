import { AddAddressByUserId, DeleteAddressById, getUserAddressesByUserId, setDefaultAddressById, UpdateAddressById } from '../controllers/address.controller';
import { authenticateToken } from '../middleware/auth';
import { createRouter } from '../utils/createRouter';

const router = createRouter();

// Only authenticated users can manage their addresses

router.post("/add", authenticateToken, AddAddressByUserId);

router.get("/getByUserId", authenticateToken, getUserAddressesByUserId);

router.put("/updateById", authenticateToken, UpdateAddressById);

router.delete("/deleteById", authenticateToken, DeleteAddressById);

router.put("/setDefaultById", authenticateToken, setDefaultAddressById);

export default router;
