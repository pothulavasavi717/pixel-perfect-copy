import type { Request, Response } from "express";
import { AppError } from "../utils/app-error.js";
import { createProduct, getProduct, listProducts } from "../services/product.service.js";

export async function listProductsController(_request: Request, response: Response): Promise<void> { response.json({ success: true, data: await listProducts() }); }
export async function getProductController(request: Request, response: Response): Promise<void> {
  const id = request.params.id;
  if (typeof id !== "string") throw new AppError("Product ID is required", 400);
  const product = await getProduct(id);
  if (!product) throw new AppError("Product not found", 404);
  response.json({ success: true, data: product });
}
export async function createProductController(request: Request, response: Response): Promise<void> { response.status(201).json({ success: true, data: await createProduct(request.body) }); }
