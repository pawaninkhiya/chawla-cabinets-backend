import express from "express";
import { validate } from "../middlewares/validate";
import { addColorOptionSchema, createProductSchema } from "../validators/product.validator";
import {
  addProductColorOption,
  createProduct,
  getAllProducts,
  getProductById,
  updateProductColorOption,
} from "../controllers/product.controller";
import { productUpload, upload } from "../middlewares/multer";
import { authMiddleware } from "../middlewares/authMiddleware";


const router = express.Router();

// Create product
router.post(
  "/",
  authMiddleware,
  productUpload,
  validate(createProductSchema),
  createProduct
);

// Get all products
router.get("/", authMiddleware, getAllProducts);

// Get product by id
router.get("/:id", authMiddleware, getProductById);

// ✅ Update color option (add/remove images, update fields)
router.put(
  "/:productId/colors/:colorId",
  authMiddleware,
  upload.array("images"), // handle new color images
  updateProductColorOption
);

router.post(
    "/:productId/colors",
    authMiddleware,
    upload.array("images"), 
    validate(addColorOptionSchema),
    addProductColorOption
);
export default router;
