import { Schema , model } from "mongoose";
import { IAddress } from "../utils/interface";

const AddressSchema = new Schema<IAddress>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    street: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    postalCode: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['home', 'work', 'other'],
        default: 'home',
    },
}, { timestamps: true })

const Address = model<IAddress>("Address", AddressSchema);

export default Address;