import express from "express";
import { validate } from "../middlewares/validate";
import { createUserSchema, loginUserSchema } from "../validators/user.validator";
import {
    createUserController,
    getUserByIdController,
    loginController
} from "../controllers/user.controller";

const router = express.Router();

router.post("/", validate(createUserSchema), createUserController);
router.post("/login", validate(loginUserSchema), loginController);
router.get("/:id", getUserByIdController);

export default router;
