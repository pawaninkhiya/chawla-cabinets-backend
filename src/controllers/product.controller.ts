import { Request, Response } from "express";
import { asyncHandler, errorResponse, successResponse } from "../utils/handlers";
import { ProductModel } from "../models/product.model";
import { uploadFileToS3, uploadMultipleToS3 } from "../utils/s3Utils";

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
    const {
        name,
        modelId,
        categoryId,
        description,
        numberOfDoors,
        colorOptionsCount,
        price,
        mrp,
        material,
        warranty,
        paintType,
        colors,
    } = req.body;

    const parsedColors =
        typeof colors === "string" ? JSON.parse(colors) : colors || [];

    let cardImageUrl: string | undefined;
    if (req.files && "cardImage" in req.files) {
        const file = (req.files as any).cardImage[0];
        cardImageUrl = await uploadFileToS3(file);
    }

    // ✅ Upload color images per indexx
    const updatedColors = await Promise.all(
        parsedColors.map(async (color: any, index: number) => {
            let uploadedImages: string[] = [];

            if (req.files) {
                const filesMap = req.files as { [fieldname: string]: Express.Multer.File[] };
                const colorFieldName = `colorImages_${index}`;

                if (filesMap[colorFieldName]) {
                    uploadedImages = await uploadMultipleToS3(filesMap[colorFieldName]);
                }
            }

            return {
                ...color,
                images: uploadedImages.length > 0 ? uploadedImages : color.images || [],
            };
        })
    );

    // ✅ Prevent duplicates (unique per modelId + name)
    const existingProduct = await ProductModel.findOne({
        name: name.trim(),
        modelId,
    });
    if (existingProduct) {
        return errorResponse(
            res,
            "Product with this name already exists for the selected model",
            409
        );
    }

    // ✅ Save to DB
    const newProduct = await ProductModel.create({
        name: name.trim(),
        modelId,
        categoryId,
        description: description?.trim() || "",
        numberOfDoors,
        colorOptionsCount,
        price,
        mrp,
        material,
        warranty,
        paintType,
        cardImage: cardImageUrl,
        colors: updatedColors,
    });

    return successResponse(res, newProduct, "Product created successfully", 201);
});
