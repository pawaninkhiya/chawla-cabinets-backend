import Joi from "joi";


export const createUserSchema = Joi.object({
    name: Joi.string().trim().min(1).required().messages({
        "string.empty": "Name is required",
        "any.required": "Name is required",
    }),
    email: Joi.string().email().lowercase().required().messages({
        "string.empty": "Email is required",
        "string.email": "Email must be a valid email address",
        "any.required": "Email is required",
    }),
    password: Joi.string().min(6).required().messages({
        "string.empty": "Password is required",
        "string.min": "Password must be at least 6 characters",
        "any.required": "Password is required",
    }),
    role: Joi.string().valid("admin", "user").default("admin").messages({
        "any.only": "Role must be either admin or user",
    }),
});


// LOGIN VALIDATION
export const loginUserSchema = Joi.object({
    email: Joi.string().email().lowercase().required().messages({
        "string.empty": "Email is required",
        "string.email": "Email must be a valid email address",
        "any.required": "Email is required",
    }),
    password: Joi.string().min(6).required().messages({
        "string.empty": "Password is required",
        "string.min": "Password must be at least 6 characters",
        "any.required": "Password is required",
    }),
});