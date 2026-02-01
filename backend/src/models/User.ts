import {Schema, model } from "mongoose";
import { IUser } from "../utils/interface";

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    refreshToken: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const User = model<IUser>("User", userSchema);

export default User;
