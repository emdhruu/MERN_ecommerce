import { Request, Response } from "express";
import Address from "../models/Address";


const CreateAddress = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const address = new Address(data);
        await address.save();
        res.status(201).json({ message: "Address created successfully", data: address });
    } catch (error) {
        res.status(500).json({ message: "Error creating address", error });
    }
}

const AddressByUserId = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        const addresses = await Address.find({ user: userId });
        res.status(200).json({ message: "Addresses fetched successfully", data: addresses });
    } catch (error) {
        res.status(500).json({ message: "Error fetching addresses", error });
    }
}
const UpdateAddressById = async (req: Request, res: Response) => {
    try {
        const addressId = req.params.id;
        const data = req.body;
        const address = await Address.findByIdAndUpdate(addressId, data, { new: true });
        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }
        res.status(200).json({ message: "Address updated successfully", data: address });
    } catch (error) {
        res.status(500).json({ message: "Error updating address", error });
    }
}

const DeleteAddressById = async (req: Request, res: Response) => {
    try {
        const addressId = req.params.id;
        const address = await Address.findByIdAndDelete(addressId);
        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }
        res.status(200).json({ message: "Address deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting address", error });
    }
}

export { CreateAddress, AddressByUserId, UpdateAddressById, DeleteAddressById };    