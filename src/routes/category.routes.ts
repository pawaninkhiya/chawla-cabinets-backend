import express from "express";
import {
    createCategoryController,
    deleteCategoryController,
    getAllCategoriesController,
    getCategoryOptionsController
} from "../controllers/category.controller";
import { validate } from "../middlewares/validate";
import { createCategorySchema } from "../validators/category.validator";

const router = express.Router();


router.post("/create", validate(createCategorySchema), createCategoryController);
router.get("/", getAllCategoriesController);
router.get("/options", getCategoryOptionsController);
router.delete("/:id", deleteCategoryController);

export default router;
