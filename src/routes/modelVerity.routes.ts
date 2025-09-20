import express from "express";
import { validate } from "../middlewares/validate";
import { createModelSchema, updateModelSchema } from "../validators/model.validator";
import { createModelVerityController, deleteModelVerityController, getAllModelVerityController, getModelVerityOptionsController, updateModelVerityController } from "../controllers/modelVerity.controller";

const router = express.Router();
router.post("/create", validate(createModelSchema), createModelVerityController);
router.get("/", getAllModelVerityController);
router.put("/:id", validate(updateModelSchema), updateModelVerityController);
router.delete("/:id", deleteModelVerityController);
router.get("/options", getModelVerityOptionsController);
export default router;