import express from "express";
import { validate } from "../middlewares/validate";
import { createProductSchema } from "../validators/product.validator";
import { createProduct } from "../controllers/product.controller";
import { upload } from "../middlewares/multer";


const router = express.Router();

// Create product
router.post("/", upload.fields([
    { name: "cardImage", maxCount: 1 },
    // { name: "colorImages_0", maxCount: 5 },
    // { name: "colorImages_1", maxCount: 5 }
]),
    validate(createProductSchema),
    createProduct
);

export default router;
