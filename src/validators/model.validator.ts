import Joi from "joi";

export const createModelSchema = Joi.object({
    name: Joi.string().trim().min(1).required().messages({
        "string.empty": "Model name is required",
        "any.required": "Model name is required",
    }),
    description: Joi.string().allow("").trim(),
    categoryId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
        "string.empty": "Category ID is required",
        "any.required": "Category ID is required",
        "string.pattern.base": "Category ID must be a valid ObjectId",
    }),
});

export const updateModelSchema = Joi.object({
    name: Joi.string().trim().min(1).optional().messages({
        "string.empty": "Model name cannot be empty",
    }),
    description: Joi.string().allow("").trim().optional(),
    categoryId: Joi.string().optional(),
}).min(1);

