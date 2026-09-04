import { Router, type Request, type Response } from "express";
import { authenticate } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/authorize.js";
import { loginController, meController, registerController } from "../controllers/auth.controller.js";

export const authRouter = Router();
authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.get("/me", authenticate, meController);

const adminTestHandler = (_request: Request, response: Response) => {
  response.json({ success: true, message: "Admin access granted" });
};
const inspectorTestHandler = (_request: Request, response: Response) => {
  response.json({ success: true, message: "Inspector access granted" });
};
const reviewerTestHandler = (_request: Request, response: Response) => {
  response.json({ success: true, message: "Reviewer access granted" });
};

authRouter.get("/admin/test", authenticate, authorizeRoles("ADMIN"), adminTestHandler);
authRouter.get("/inspector/test", authenticate, authorizeRoles("ADMIN", "INSPECTOR"), inspectorTestHandler);
authRouter.get("/reviewer/test", authenticate, authorizeRoles("ADMIN", "REVIEWER"), reviewerTestHandler);

export const rbacRouter = Router();
rbacRouter.get("/admin/test", authenticate, authorizeRoles("ADMIN"), adminTestHandler);
rbacRouter.get("/inspector/test", authenticate, authorizeRoles("ADMIN", "INSPECTOR"), inspectorTestHandler);
rbacRouter.get("/reviewer/test", authenticate, authorizeRoles("ADMIN", "REVIEWER"), reviewerTestHandler);
