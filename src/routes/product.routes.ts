import express from "express";
import { validate } from "../middlewares/validate";
import { createProductSchema } from "../validators/product.validator";
import { createProduct, getAllProducts } from "../controllers/product.controller";
import { productUpload } from "../middlewares/multer";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  productUpload,
  validate(createProductSchema),
  createProduct
);

router.get("/", authMiddleware, getAllProducts);

export default router;
