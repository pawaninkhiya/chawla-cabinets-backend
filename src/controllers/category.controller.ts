import { Request, Response } from "express";
import { asyncHandler, errorResponse, successResponse } from "../utils/handlers";
import CategoryModel from "../models/category.model";
import { buildSearchQuery } from "../utils/query";
import { paginate } from "../utils/pagination";

// ---------------- GET CREATE CATEGORY ----------------

export const createCategoryController = asyncHandler(
    async (req: Request, res: Response) => {
        const { categoryName, description } = req.body;
        const existingCategory = await CategoryModel.findOne({ categoryName: categoryName.trim() });
        if (existingCategory) {
            return errorResponse(res, "Category with this categoryName already exists", 409);
        }

        const category = await CategoryModel.create({
            categoryName: categoryName.trim(),
            description: description?.trim() || "",
        });
        return successResponse(res, category, "Category created successfully", 201);
    }
);

// ---------------- GET ALL CATEGORIES ----------------

export const getAllCategoriesController = asyncHandler(
    async (req: Request, res: Response) => {
        try {
            const search = (req.query.search as string) || "";
            const page = req.query.page ? Number(req.query.page) : 1;
            const limit = req.query.limit ? Number(req.query.limit) : 10;

            const query = buildSearchQuery(search, ["categoryName"]);

            const totalCategories = await CategoryModel.countDocuments(query);
            if (totalCategories === 0) {
                return errorResponse(res, "No categories found", 200);
            }

            const { skip, limit: pageSize, page: currentPage, totalPages } = paginate(totalCategories, { page, limit });

            const categories = await CategoryModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageSize);

            return successResponse(res, {
                categories,
                pagination: {
                    total: totalCategories,
                    page: currentPage,
                    limit: pageSize,
                    totalPages,
                },
            }, "Categories fetched successfully", 200);
        } catch (err) {
            console.error(err);
            return errorResponse(res, "Server error", 500);
        }
    }
);

// ---------------- UPDATE CATEGORY BY ID ----------------

export const updateCategoryController = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const { categoryName, description } = req.body;

        const category = await CategoryModel.findById(id);
        if (!category) {
            return errorResponse(res, "Category not found", 404);
        }

        if (categoryName && categoryName.trim() !== category.categoryName) {
            const existingCategory = await CategoryModel.findOne({
                categoryName: categoryName.trim(),
                _id: { $ne: id },
            });
            if (existingCategory) {
                return errorResponse(res, "Category with this categoryName already exists", 409);
            }
        }
        if (categoryName !== undefined) {
            category.categoryName = categoryName.trim();
        }
        if (description !== undefined) {
            category.description = description.trim();
        }

        const updatedCategory = await category.save();

        return successResponse(res, updatedCategory, "Category updated successfully", 200);
    }
);

// ---------------- DELETE CATEGORY BY ID ----------------

export const deleteCategoryController = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const category = await CategoryModel.findById(id);
        if (!category) {
            return errorResponse(res, "Category not found", 404);
        }

        await CategoryModel.findByIdAndDelete(id);

        return successResponse(res, null, "Category deleted successfully", 200);
    }
);

// ---------------- GET CATEGORY OPTIONS  ----------------

export const getCategoryOptionsController = asyncHandler(
    async (req: Request, res: Response) => {
        try {
            const categories = await CategoryModel.find({}, "_id categoryName").sort({ categoryName: 1 });

            if (!categories || categories.length === 0) {
                return errorResponse(res, "No categories found", 404);
            }

            return successResponse(
                res,
                categories,
                "Category options fetched successfully",
                200
            );
        } catch (err) {
            console.error(err);
            return errorResponse(res, "Server error", 500);
        }
    }
);


// ---------------- GET SINGLE CATEGORY BY ID ----------------

export const getCategoryByIdController = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const category = await CategoryModel.findById(id);

        if (!category) {
            return errorResponse(res, "Category not found", 404);
        }

        return successResponse(res, category, "Category fetched successfully", 200);
    }
);
