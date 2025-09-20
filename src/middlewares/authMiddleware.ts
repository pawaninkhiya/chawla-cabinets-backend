import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/handlers";
import { JwtPayload } from "../utils/jwt";
import UserModel from "../models/user.model";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return errorResponse(res, "Authorization token missing", 401);
        }

        const token = authHeader.split(" ")[1];
        const secret = process.env.JWT_SECRET!;
        const decoded = jwt.verify(token, secret) as JwtPayload;

        const user = await UserModel.findById(decoded.id).select("-password");
        if (!user) return errorResponse(res, "User not found", 404);

        req.user = {
            _id: String(user._id),
            name: user.name,
            email: user.email,
            role: user.role,
        };

        next();
    } catch (err) {
        return errorResponse(res, "Unauthorized: Invalid or expired token", 401);
    }
};

export const authorizeRoles = (...roles: ("admin" | "user")[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return errorResponse(res, "Forbidden: Access denied", 403);
        }
        next();
    };
};
