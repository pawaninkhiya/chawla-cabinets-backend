import { Request, Response } from "express";
import { asyncHandler, errorResponse, successResponse } from "../utils/handlers";
import { ProductModel } from "../models/product.model";
import { uploadFileToS3, uploadMultipleToS3 } from "../utils/s3Utils";
import { buildSearchQuery } from "../utils/query";
import { paginate } from "../utils/pagination";

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
    const { _id } = req.user;
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

    const parsedColors = typeof colors === "string" ? JSON.parse(colors) : colors || [];

    const filesMap: { [key: string]: Express.Multer.File[] } = {};
    (req.files as Express.Multer.File[]).forEach(file => {
        if (!filesMap[file.fieldname]) filesMap[file.fieldname] = [];
        filesMap[file.fieldname].push(file);
    });


    let cardImageUrl: string | undefined;
    if (filesMap["cardImage"]?.[0]) {
        cardImageUrl = await uploadFileToS3(filesMap["cardImage"][0]);
    }

    const updatedColors = await Promise.all(
        parsedColors.map(async (color: any, index: number) => {
            const uploadedImages: string[] = [];

            for (const field of Object.keys(filesMap)) {
                if (field.startsWith(`color_${index}_image_`)) {
                    const uploaded = await uploadMultipleToS3(filesMap[field]);
                    uploadedImages.push(...uploaded);
                }
            }

            return {
                ...color,
                images: uploadedImages.length ? uploadedImages : color.images || [],
            };
        })
    );


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
        createdBy: _id
    });

    return successResponse(res, newProduct, "Product created successfully", 201);
});

export const getAllProducts = asyncHandler(async (req: Request, res: Response) => {
    try {
        const search = (req.query.search as string) || "";
        const page = req.query.page ? Number(req.query.page) : 1;
        const limit = req.query.limit ? Number(req.query.limit) : 20;
        const { categoryId, modelId } = req.query;
        let query: any = buildSearchQuery(search, ["name"]);

        if (categoryId) query.categoryId = categoryId;
        if (modelId) query.modelId = modelId;

        const total = await ProductModel.countDocuments(query);
        if (total === 0) {
            return errorResponse(res, "No products found", 200);
        }

        const { skip, limit: pageSize, page: currentPage, totalPages } = paginate(total, { page, limit });


        const products = await ProductModel.find(query)
            .populate("categoryId", "categoryName")
            .populate("modelId", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize);

        return successResponse(
            res,
            {
                products,
                pagination: {
                    total,
                    page: currentPage,
                    limit: pageSize,
                    totalPages,
                },
            },
            "Products fetched successfully",
            200
        );
    } catch (err) {
        console.error(err);
        return errorResponse(res, "Failed to fetch products", 500);
    }
});
