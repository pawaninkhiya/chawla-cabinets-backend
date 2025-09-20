    import Joi from "joi";

    export const createProductSchema = Joi.object({
        name: Joi.string().trim().min(1).required().messages({
            "string.empty": "Product name is required",
            "any.required": "Product name is required",
        }),
        modelId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
            "string.empty": "Model ID is required",
            "any.required": "Model ID is required",
            "string.pattern.base": "Model ID must be a valid ObjectId",
        }),
        categoryId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
            "string.empty": "Category ID is required",
            "any.required": "Category ID is required",
            "string.pattern.base": "Category ID must be a valid ObjectId",
        }),
        description: Joi.string().allow("").trim(),
        numberOfDoors: Joi.number().min(1).required().messages({
            "number.base": "Number of doors must be a number",
            "any.required": "Number of doors is required",
        }),
        colorOptionsCount: Joi.number().min(0).required().messages({
            "number.base": "Color options count must be a number",
            "any.required": "Color options count is required",
        }),
        price: Joi.number().min(0).required().messages({
            "number.base": "Price must be a number",
            "any.required": "Price is required",
        }),
        mrp: Joi.number().min(0).required().messages({
            "number.base": "MRP must be a number",
            "any.required": "MRP is required",
        }),
        material: Joi.string().default("Steel").messages({
            "string.base": "Material must be a string",
        }),
        warranty: Joi.string().default("5 Years").messages({
            "string.base": "Warranty must be a string",
        }),
        paintType: Joi.string().default("Powder Coating").messages({
            "string.base": "Paint type must be a string",
        }),
        cardImage: Joi.string().uri().optional().messages({
            "string.uri": "Card image must be a valid URL",
        }),
        colors: Joi.array()
            .items(
                Joi.object({
                    name: Joi.string().trim().required().messages({
                        "string.empty": "Color name is required",
                        "any.required": "Color name is required",
                    }),
                    body: Joi.string().trim().required().messages({
                        "string.empty": "Body color is required",
                        "any.required": "Body color is required",
                    }),
                    door: Joi.string().trim().optional().messages({
                        "string.base": "Door color must be a string",
                    }),
                    images: Joi.array().items(Joi.string().uri()).min(1).required().messages({
                        "any.required": "Images are required",
                        "array.min": "At least one image is required",
                    }),
                    price: Joi.number().min(0).optional().messages({
                        "number.base": "Color price must be a number",
                    }),
                    mrp: Joi.number().min(0).optional().messages({
                        "number.base": "Color MRP must be a number",
                    }),
                    available: Joi.boolean().optional().default(true),
                })
            )
            .default([]),
    });