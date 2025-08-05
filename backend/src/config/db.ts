import mongoose from "mongoose";

export const connectDb = async () => {
    try {
        const mongodbURI = process.env.MONGO_URL;
        if (!mongodbURI) {
            throw new Error("MONGODB_URI is not defined in .env file");
        }
        const connect = await mongoose.connect(mongodbURI);
        console.log(`MongoDB connected: ${connect.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB:`, error);
    }
}