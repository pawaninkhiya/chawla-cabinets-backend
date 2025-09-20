import { Request, Response } from "express";
import { asyncHandler, errorResponse, successResponse } from "../utils/handlers";
import UserModel from "../models/user.model";
import { generateToken, JwtPayload } from "../utils/jwt";

// ------------------- CREATE USER -------------------
export const createUserController = asyncHandler(
    async (req: Request, res: Response) => {
        const { name, email, password, role } = req.body;

        const existingUser = await UserModel.findOne({ email: email.trim().toLowerCase() });
        if (existingUser) {
            return errorResponse(res, "User with this email already exists", 409);
        }

        const user = await UserModel.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            role,
        });

        return successResponse(res, user, "User created successfully", 201);
    }
);

// ------------------- LOGIN USER -------------------
export const loginController = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email: email.trim().toLowerCase() });
    if (!user) return errorResponse(res, "Invalid email or password", 401);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return errorResponse(res, "Invalid password", 401);

    const jwtPayload: JwtPayload = {
        id: String(user._id),
        role: user.role
    };

    const token = generateToken(jwtPayload);

    const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    };

    return successResponse(res, { data: userData, token }, "Login successful", 200);
});

// ------------------- GET USER BY ID -------------------
export const getUserByIdController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.params.id;

        const user = await UserModel.findById(userId).select("-password");
        console.log(user)
        if (!user) return errorResponse(res, "User not found", 404);

        return successResponse(res, { data: user }, "User retrieved successfully", 200);
    }
);
