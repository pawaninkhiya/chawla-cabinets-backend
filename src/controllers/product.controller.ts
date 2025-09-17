import { Request, Response } from "express";
import { asyncHandler, errorResponse, successResponse } from "../utils/handlers";
import { ProductModel } from "../models/product.model";
import { uploadFileToS3, uploadMultipleToS3 } from "../utils/s3Utils";

export const createProduct = asyncHandler(
    async (req: Request, res: Response) => {
        const {
            name,
            modelId,
            description,
            numberOfDoors,
            colorOptionsCount,
            price,
            mrp,
            material,
            warranty,
            paintType,
            colors
        } = req.body;

        // const parsedColors = colors ? JSON.parse(colors) : [];


        let cardImageUrl: string | undefined;
        if (req.files && "cardImage" in req.files) {
            const file = (req.files as any).cardImage[0];
            cardImageUrl = await uploadFileToS3(file);
        }

        // Upload color images if provided
        // const updatedColors = await Promise.all(
        //     parsedColors.map(async (color: any, index: number) => {
        //         let uploadedImages: string[] = [];

        //         if (req.files) {
        //             const filesMap = req.files as { [fieldname: string]: Express.Multer.File[] };
        //             const files = filesMap[`colorImages_${index}`];

        //             if (files && files.length > 0) {
        //                 uploadedImages = await uploadMultipleToS3(files);
        //             }
        //         }

        //         return {
        //             ...color,
        //             images: uploadedImages.length ? uploadedImages : color.images,
        //         };
        //     })
        // );


        // Check duplicate
        const existingProduct = await ProductModel.findOne({ name: name.trim(), modelId });
        if (existingProduct) {
            return errorResponse(res, "Product with this name already exists for the selected model", 409);
        }

        // Create product
        const newProduct = await ProductModel.create({
            name: name.trim(),
            modelId,
            description: description?.trim() || "",
            numberOfDoors,
            colorOptionsCount,
            price,
            mrp,
            material,
            warranty,
            paintType,
            cardImage: cardImageUrl,
            // colors: updatedColors
        });

        return successResponse(res, newProduct, "Product created successfully", 201);
    }
);
