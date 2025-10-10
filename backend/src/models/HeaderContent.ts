import mongoose from "mongoose";
import { IHeader } from "../utils/interface";

const HeaderSchema = new mongoose.Schema<IHeader>({
    topBar: [
        {
            text: { type: String, required: true },
            link: { type: String, required: false }
        }
    ],
    menu: [
        {
            label: { type: String, required: true },
            path: { type: String, required: true }
        },
    ],
    actionIcons: [
        {
            type: { type: String, required: true },
            icon: { type: String, required: true },
            route: { type: String, required: false }
        }
    ],
    logo: {
        type: { type: String, enum: ['url', 'text'], required: true },
        url: { type: String, required: false },
        value: { type: String, required: false },
        alt: { type: String, required: false }
    }
}, { timestamps: true })

const HeaderContent = mongoose.model<IHeader>('HeaderContent', HeaderSchema)

export default HeaderContent;