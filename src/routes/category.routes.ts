import express from "express";
import {
    createCategoryController,
    deleteCategoryController,
    getAllCategoriesController,
    getCategoryOptionsController,
    updateCategoryController
} from "../controllers/category.controller";
import { validate } from "../middlewares/validate";
import { createCategorySchema, updateCategorySchema } from "../validators/category.validator";

const router = express.Router();


router.post("/create", validate(createCategorySchema), createCategoryController);
router.get("/", getAllCategoriesController);
router.put("/:id", validate(updateCategorySchema), updateCategoryController);
router.delete("/:id", deleteCategoryController);
router.get("/options", getCategoryOptionsController);

export default router;
