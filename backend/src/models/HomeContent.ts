import mongoose from "mongoose";
import { IHomeContent } from "../utils/interface";

const HomeContentSchema = new mongoose.Schema<IHomeContent>({
    slider: [
        {
            title: { type: String, required: true },
            shortDescription: { type: String, required: true },
            link: { type: String, required: false },
            btnText: { type: String, required: false },
            backgroundImageUrl: { type: String, required: true }
        }
    ],
    categories: [
        {
            name: { type: String, required: true },
            description: { type: String, required: false },
            imageUrl: { type: String, required: true },
            link: { type: String, required: true }
        }
    ],
    bestItems: [
        {
            name: { type: String, required: true },
            imageUrl: { type: String, required: true },
            link: { type: String, required: true },
            price: { type: Number, required: true }
        }
    ],
    customerReviews: [
        {
            customerName: { type: String, required: true },
            reviewText: { type: String, required: true },
            rating: { type: Number, required: true, min: 1, max: 5 }
        }
    ],
    trustBadges: [
        {
            icon: { type: String, required: true },
            title: { type: String, required: true },
            shortText: { type: String, required: true }
        }
    ],
    displayImage: {
        type: { type: String, enum: ['url', 'text'], required: true },
        url: { type: String, required: false },
        value: { type: String, required: false },
        alt: { type: String, required: false }
    },
    itemsSequence: [
        {
            type: { type: String, enum: ['bestItems', 'categories', 'customerReviews', 'trustBadges', 'slider', 'displayImage'], required: true },
            order: { type: Number, required: true }
        }
    ]
}, { timestamps: true })

const HomeContent = mongoose.model<IHomeContent>('HomeContent', HomeContentSchema)

export default HomeContent;