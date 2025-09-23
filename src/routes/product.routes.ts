import express from "express";
import { validate } from "../middlewares/validate";
import {
  addColorOptionSchema,
  createProductSchema
} from "../validators/product.validator";
import {
  addProductColorOption,
  createProduct,
  getAllProducts,
  getProductById,
  updateProductColorOption,
  updateProductColorImagesOrder,
  deleteProduct,
  updateProduct,
} from "../controllers/product.controller";
import { productUpload, upload } from "../middlewares/multer";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

// Create product
router.post("/", authMiddleware, productUpload, validate(createProductSchema), createProduct);

// Get all products
router.get("/", authMiddleware, getAllProducts);

// Get single product by ID
router.get("/:id", authMiddleware, getProductById);

// Update product details 
router.put("/:id", authMiddleware, upload.none(), updateProduct);

// Delete product
router.delete("/:id", authMiddleware, deleteProduct);

// Add new color option to a product
router.post("/:productId/colors", authMiddleware, upload.array("images"), validate(addColorOptionSchema), addProductColorOption);

// Update color option
router.put("/:productId/colors/:colorId", authMiddleware, upload.array("images"), updateProductColorOption);

// Update color images order
router.put("/:productId/colors/:colorId/images-order",authMiddleware,updateProductColorImagesOrder);

export default router;
