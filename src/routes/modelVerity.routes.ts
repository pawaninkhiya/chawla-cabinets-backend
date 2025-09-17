import express from "express";
import { validate } from "../middlewares/validate";
import { createModelSchema } from "../validators/model.validator";
import { createModelVerityController, deleteModelVerityController, getAllModelVerityController } from "../controllers/modelVerity.controller";

const router = express.Router();
router.post("/create", validate(createModelSchema), createModelVerityController);
router.get("/", getAllModelVerityController);
router.delete("/:id", deleteModelVerityController);
export default router;