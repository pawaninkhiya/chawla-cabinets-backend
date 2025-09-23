import { Request, Response } from "express";
import { asyncHandler, errorResponse, successResponse } from "../utils/handlers";
import { ProductModel } from "../models/product.model";
import { deleteMultipleFromS3, uploadFileToS3, uploadMultipleToS3 } from "../utils/s3Utils";
import { buildSearchQuery } from "../utils/query";
import { paginate } from "../utils/pagination";



//  CREATE PRODUCT
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

//  GET ALL PRODUCTS
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

//  GET PRODUCT BY ID
export const getProductById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        return errorResponse(res, "Product ID is required", 400);
    }

    const product = await ProductModel.findById(id)
        .populate("categoryId", "categoryName")
        .populate("modelId", "name")
        .populate("createdBy", "name")

    if (!product) {
        return errorResponse(res, "Product not found", 404);
    }

    return successResponse(res, { product }, "Product fetched successfully", 200);
});

//  UPDATE PRODUCT

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) return errorResponse(res, "Product ID is required", 400);

    const product = await ProductModel.findById(id);
    if (!product) return errorResponse(res, "Product not found", 404);
    const { colors, ...rest } = updateData;
    Object.assign(product, rest);

    await product.save();

    return successResponse(res, product, "Product updated successfully (colors not updated)", 200);
});

// UPDATE PRODUCT COLOR OPTION
export const updateProductColorOption = asyncHandler(async (req: Request, res: Response) => {
    const { productId, colorId } = req.params;
    const { name, body, door, price, mrp, available, removeImages } = req.body;

    if (!productId) return errorResponse(res, "Product ID is required", 400);
    if (!colorId) return errorResponse(res, "Color ID is required", 400);

    const product = await ProductModel.findById(productId);
    if (!product) return errorResponse(res, "Product not found", 404);

    const color = product.colors.id(colorId);
    if (!color) return errorResponse(res, "Color option not found", 404);

    let updatedImages = [...(color.images || [])];

    if (removeImages?.length > 0) {
        const removeArray: string[] = Array.isArray(removeImages) ? removeImages : [removeImages];
        const keysToDelete = removeArray.map((url) => url.split("/").pop() as string);
        await deleteMultipleFromS3(keysToDelete);
        updatedImages = updatedImages.filter((img) => !removeArray.includes(img));
    }
    const files = (req.files as Express.Multer.File[]) || [];
    if (files.length > 0) {
        const uploadedUrls = await uploadMultipleToS3(files);
        updatedImages.push(...uploadedUrls);
    }
    if (name !== undefined) color.name = name;
    if (body !== undefined) color.body = body;
    if (door !== undefined) color.door = door;
    if (price !== undefined) color.price = price;
    if (mrp !== undefined) color.mrp = mrp;
    if (available !== undefined) color.available = available;
    color.images = updatedImages;

    await product.save();

    return successResponse(res, color, "Color option updated successfully", 200);
});


//  ADD PRODUCT COLOR OPTION
export const addProductColorOption = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const { name, body, door, price, mrp, available } = req.body;

    if (!productId) return errorResponse(res, "Product ID is required", 400);

    const product = await ProductModel.findById(productId);
    if (!product) return errorResponse(res, "Product not found", 404);

    const files = (req.files as Express.Multer.File[]) || [];
    let uploadedImages: string[] = [];
    if (files.length > 0) {
        uploadedImages = await uploadMultipleToS3(files);
    }

    const newColor = {
        name,
        body,
        door: door || "",
        price: price || 0,
        mrp: mrp || 0,
        available: available !== undefined ? available : true,
        images: uploadedImages,
    };

    product.colors.push(newColor);
    await product.save();

    return successResponse(res, newColor, "Color option added successfully", 201);
});

// UPDATE PRODUCT COLOR IMAGES ORDER
export const updateProductColorImagesOrder = asyncHandler(async (req: Request, res: Response) => {
    const { productId, colorId } = req.params;
    const { newOrder } = req.body;

    if (!productId) return errorResponse(res, "Product ID is required", 400);
    if (!colorId) return errorResponse(res, "Color ID is required", 400);
    if (!Array.isArray(newOrder)) return errorResponse(res, "newOrder must be an array of image URLs", 400);

    const product = await ProductModel.findById(productId);
    if (!product) return errorResponse(res, "Product not found", 404);

    const color = product.colors.id(colorId);
    if (!color) return errorResponse(res, "Color option not found", 404);

    const currentImages = color.images || [];
    const isValidOrder = newOrder.every(url => currentImages.includes(url));
    if (!isValidOrder) return errorResponse(res, "All image URLs must already exist for this color", 400);

    color.images = newOrder;

    await product.save();

    return successResponse(res, color, "Color images order updated successfully", 200);
});

// DELETE PRODUCT
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) return errorResponse(res, "Product ID is required", 400);

    const product = await ProductModel.findById(id);
    if (!product) return errorResponse(res, "Product not found", 404);

    const imagesToDelete: string[] = [];
    if (product.cardImage) imagesToDelete.push(product.cardImage);
    product.colors.forEach(color => {
        if (color.images?.length > 0) imagesToDelete.push(...color.images);
    });

    if (imagesToDelete.length > 0) {
        const keys = imagesToDelete.map(url => url.split("/").pop() as string);
        await deleteMultipleFromS3(keys);
    }

    await product.deleteOne();

    return successResponse(res, null, "Product deleted successfully", 200);
});

