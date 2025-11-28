import { Request, Response } from "express";
import Address from "../models/Address";

const AddAddressByUserId = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        const newAddress = req.body;

        let addressDoc = await Address.findOne({ user: userId });

        if (addressDoc) {
            addressDoc.items.push(newAddress);
        } else {
            addressDoc = new Address({
                user: userId,
                items: [newAddress],
            });
        }
        await addressDoc.save();
        res.status(201).json({ message: "Address added successfully", data: addressDoc });
    } catch (error) {
        res.status(500).json({ message: "Server error, Please try again later", error });
    }
}

const getUserAddressesByUserId = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        const addresses = await Address.findOne({ user: userId });

        if (!addresses) {
            return res.status(404).json({ message: "No addresses found for this user" });
        }

        res.status(200).json({ message: "Addresses fetched successfully", data: addresses });
    } catch (error) {
        res.status(500).json({ message: "Server error, Please try again later", error });
    }
}

const UpdateAddressById = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        const { addressId, updateData } = req.body;

        const updated = await Address.findOneAndUpdate(
            { user: userId, "items._id" : addressId },
            { $set: { "items.$": updateData } },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Address not found" });
        }

        res.status(200).json({ message: "Address updated successfully", data: updated });
    } catch (error) {
        res.status(500).json({ message: "Server error, Please try again later", error });
    }
}

const DeleteAddressById = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        const { addressId } = req.body;

        const updated = await Address.findOneAndUpdate(
            { user: userId },
            { $pull: { items: { _id: addressId } } },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Address not found" });
        }

        res.status(200).json({ message : "Address deleted successfully", data: updated });
    } catch (error) {
        res.status(500).json({ message: "Server error, Please try again later", error });
    }
}

const setDefaultAddressById = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        const { addressId } = req.body;

        if (!addressId) {
            return res.status(400).json({ message: "Adddress Id is required" });
        }

        const addressDoc = await Address.findOne({ user: userId });
        if (!addressDoc) {
            return res.status(404).json({ message: "No addresses found for this user" });
        }

        const addressItem = addressDoc.items.find(item => item._id?.toString() === addressId);

        if (!addressItem) {
            return res.status(404).json({ message: "Address not found" });
        }

        addressDoc.items.forEach( addr => addr.isDefault = false);

        addressItem.isDefault = true;

        await addressDoc.save();

        res.status(200).json({ message: "Default address set successfully", data: addressDoc });
    } catch (error) {
        res.status(500).json({ message: "Server error, Please try again later", error });
    }
}

export { AddAddressByUserId, DeleteAddressById , getUserAddressesByUserId, UpdateAddressById, setDefaultAddressById };    