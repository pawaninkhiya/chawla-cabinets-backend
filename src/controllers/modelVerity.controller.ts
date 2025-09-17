import { Request, Response } from "express";
import { asyncHandler, errorResponse, successResponse } from "../utils/handlers";
import ModelVerity from "../models/modelVerity.model";
import { buildSearchQuery } from "../utils/query";
import { paginate } from "../utils/pagination";

// ---------------- CREATE MODEL VERITY ----------------

export const createModelVerityController = asyncHandler(
    async (req: Request, res: Response) => {
        const { name, description, categoryId } = req.body;
        const existing = await ModelVerity.findOne({ name: name });
        if (existing) {
            return errorResponse(res, "Model Verity with this name already exists", 409);
        }

        const modelVerity = await ModelVerity.create({
            name: name.trim(),
            description: description || "",
            categoryId,
        });

        return successResponse(res, modelVerity, "Model Verity created successfully", 201);
    }
);

// ---------------- GET ALL MODEL VERITY (with pagination + search) ----------------

export const getAllModelVerityController = asyncHandler(
    async (req: Request, res: Response) => {
        try {
            const search = (req.query.search as string) || "";
            const page = req.query.page ? Number(req.query.page) : 1;
            const limit = req.query.limit ? Number(req.query.limit) : 10;

            const query = buildSearchQuery(search, ["name"]);

            const total = await ModelVerity.countDocuments(query);
            if (total === 0) {
                return errorResponse(res, "No model verities found", 404);
            }

            const { skip, limit: pageSize, page: currentPage, totalPages } = paginate(total, { page, limit });

            const modelVerities = await ModelVerity.find(query)
                .populate("categoryId", "categoryName") // only fetch categoryName from Category
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageSize);

            return successResponse(res, {
                modelVerities,
                pagination: {
                    total,
                    page: currentPage,
                    limit: pageSize,
                    totalPages,
                },
            }, "Model Verities fetched successfully", 200);
        } catch (err) {
            console.error(err);
            return errorResponse(res, "Server error", 500);
        }
    }
);

// ---------------- DELETE MODEL VERITY BY ID ----------------
export const deleteModelVerityController = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const modelVerity = await ModelVerity.findById(id);
        if (!modelVerity) {
            return errorResponse(res, "Model Verity not found", 404);
        }

        await ModelVerity.findByIdAndDelete(id);

        return successResponse(res, null, "Model Verity deleted successfully", 200);
    }
);
