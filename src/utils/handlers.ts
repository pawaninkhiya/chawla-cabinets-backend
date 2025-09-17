import { Response } from "express";

export function successResponse(res: Response,payload: any,message: string = "Success",statusCode: number = 200): Response {
    if (typeof payload === "object" && !Array.isArray(payload) && payload !== null) {
        return res.status(statusCode).json({
            success: true,
            message,
            ...payload,
        });
    }
    return res.status(statusCode).json({
        success: true,
        message,
        data: payload,
    });
}

export function errorResponse(res: Response, message: string | string[] | Record<string, string[]> = "An error occurred", statusCode: number = 500, error?: any): Response {
    return res.status(statusCode).json({
        success: false,
        message,
        ...(error && { error: getErrorMessage(error) }),
    });
}


export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    if (isErrorWithMessage(error)) {
        return error.message;
    }

    return String(error);
}

function isErrorWithMessage(error: unknown): error is { message: string } {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message: unknown }).message === 'string'
    );
}


export function asyncHandler(fn: (req: any, res: Response, next?: any) => Promise<any>) {
    return (req: any, res: Response, next: any) => {
        Promise.resolve(fn(req, res, next)).catch((err) => {
            console.error(err);
            errorResponse(res, "An unexpected error occurred", 500, err);
        });
    };
}