import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/handlers";
export const validate =
    (schema: any) => (req: Request, res: Response, next: NextFunction) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            allowUnknown: false,
            stripUnknown: true,
        });

        if (error) {
            return errorResponse(
                res,
                error.details.map((d: any) => d.message),
                400
            );
        }

        req.body = value; 
        next();
    };
