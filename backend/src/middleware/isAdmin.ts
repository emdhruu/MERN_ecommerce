import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "./auth";

const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user){
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    next();
}

export { isAdmin };