import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: any;
}

const verifyingAccessToken = (
  req: AuthRequest,
  res: Response, 
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "No authorization header provided" });
  const token = authHeader.split(" ")[1];
  const ACCESS_TOKEN = process.env.JWT_ACCESS_TOKEN_SECRET;
  if (!ACCESS_TOKEN) {
    return res.status(500).json({ message: "Access token secret is not defined" });
  }

  jwt.verify(token, ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = decoded;
    next();
  });
};

export { verifyingAccessToken };
