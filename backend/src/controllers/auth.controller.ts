import type { Request, Response } from "express";
import { getAuthenticatedUser, login, register } from "../services/auth.service.js";
import { validateLoginInput, validateRegisterInput } from "../validators/auth.js";

export async function registerController(request: Request, response: Response): Promise<void> {
  response.status(201).json({ success: true, data: await register(validateRegisterInput(request.body)) });
}

export async function loginController(request: Request, response: Response): Promise<void> {
  response.json({ success: true, data: await login(validateLoginInput(request.body)) });
}

export async function meController(request: Request, response: Response): Promise<void> {
  if (!request.user) {
    response.status(401).json({ success: false, message: "Authentication required" });
    return;
  }
  response.json({ success: true, data: { user: await getAuthenticatedUser(request.user.id) } });
}
