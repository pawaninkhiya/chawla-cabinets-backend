import express from "express";
import { validate } from "../middlewares/validate";
import { createProductSchema } from "../validators/product.validator";
import { createProduct } from "../controllers/product.controller";
import { upload } from "../middlewares/multer";

const router = express.Router();

// Expect payload:
// - cardImage (file)
// - colorImages_0, colorImages_1... (files)
// - other fields in req.body
router.post(
  "/",
  upload.fields([
    { name: "cardImage", maxCount: 1 },
    // Add as many as you expect max color variants
    { name: "colorImages_0", maxCount: 10 },
    { name: "colorImages_1", maxCount: 10 },
    { name: "colorImages_2", maxCount: 10 },
    { name: "colorImages_3", maxCount: 10 },
  ]),
  validate(createProductSchema),
  createProduct
);

export default router;
