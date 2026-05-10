import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "./verifyingAccessToken";

const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    console.log("in admin",req.user);
    if (!req.user){
        return res.status(403).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    next();
}

export { isAdmin };