import mongoose from "mongoose";
import { IFooter } from "../utils/interface";

const FooterContentSchema = new mongoose.Schema<IFooter>({
    logo: {
        type: String,
        enum: ['url', 'text'],
        required: true,
    },
    description: {
        text: { type: String, required: true },
    },
    socialMediaLinks: [
        {
            platform: { type: String, required: true },
            url: { type: String, required: true },
            icon: { type: String, required: true },
        }
    ],
    quickLinks: [
        {
            label: { type: String, required: true },
            url: { type: String, required: true },
        }
    ],
    helpInfo: [
        {
            label: { type: String, required: true },
            url: { type: String, required: true },
        }
    ],
    contactInfo: [
        {
            text: { type: String, required: true },
            link: { type: String },
        }
    ],
},{ timestamps: true });

const FooterContent = mongoose.model<IFooter>('FooterContent', FooterContentSchema);

export default FooterContent;