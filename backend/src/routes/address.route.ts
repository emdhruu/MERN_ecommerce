import { AddAddressByUserId, DeleteAddressById, getUserAddressesByUserId, setDefaultAddressById, UpdateAddressById } from '../controllers/address.controller';
import { verifyingAccessToken } from '../middleware/verifyingAccessToken';
import { createRouter } from '../utils/createRouter';

const router = createRouter();

// Only authenticated users can manage their addresses

router.post("/add", verifyingAccessToken, AddAddressByUserId);

router.get("/getByUserId", verifyingAccessToken, getUserAddressesByUserId);

router.put("/updateById", verifyingAccessToken, UpdateAddressById);

router.delete("/deleteById", verifyingAccessToken, DeleteAddressById);

router.put("/setDefaultById", verifyingAccessToken, setDefaultAddressById);

export default router;
