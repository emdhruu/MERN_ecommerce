import express from 'express';
import { AddAddressByUserId, DeleteAddressById, getUserAddressesByUserId, setDefaultAddressById, UpdateAddressById } from '../controllers/address.controller';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Only authenticated users can manage their addresses

router.post("/addAddress", authenticateToken, AddAddressByUserId);

router.get("/getAddresses", authenticateToken, getUserAddressesByUserId);

router.put("/updateAddress", authenticateToken, UpdateAddressById);

router.delete("/deleteAddress", authenticateToken, DeleteAddressById);

router.put("/setDefaultAddress", authenticateToken, setDefaultAddressById);

export default router;
