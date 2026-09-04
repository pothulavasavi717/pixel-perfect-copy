import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { createProductController, getProductController, listProductsController } from "../controllers/product.controller.js";

export const productRouter = Router();
productRouter.use(authenticate);
productRouter.post("/", createProductController);
productRouter.get("/", listProductsController);
productRouter.get("/:id", getProductController);
