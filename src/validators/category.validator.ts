import Joi from "joi";

export const createCategorySchema = Joi.object({
    categoryName: Joi.string().trim().min(1).required().messages({
        "string.empty": "Category name is required",
        "any.required": "Category name is required",
    }),
    description: Joi.string().allow("").trim(),
});


export const updateCategorySchema = Joi.object({
    categoryName: Joi.string().trim().min(1).optional().messages({
        "string.empty": "Category name cannot be empty",
    }),
    description: Joi.string().allow("").trim().optional(),
}).min(1); 
