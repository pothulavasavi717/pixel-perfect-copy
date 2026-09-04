import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { imageUpload } from "../middleware/upload.js";
import { createInspectionController, getInspectionController, listInspectionsController, updateInspectionController } from "../controllers/inspection.controller.js";
import { listImagesController, uploadImageController } from "../controllers/image.controller.js";
import { getComplianceController, runComplianceController } from "../controllers/compliance.controller.js";
import { extractController } from "../controllers/extraction.controller.js";

export const inspectionRouter = Router();
inspectionRouter.use(authenticate);
inspectionRouter.post("/", createInspectionController);
inspectionRouter.get("/", listInspectionsController);
inspectionRouter.get("/:id", getInspectionController);
inspectionRouter.put("/:id", updateInspectionController);
inspectionRouter.post("/:inspectionId/images", imageUpload.single("image"), uploadImageController);
inspectionRouter.get("/:inspectionId/images", listImagesController);
inspectionRouter.post("/:id/compliance/run", runComplianceController);
inspectionRouter.get("/:id/compliance", getComplianceController);
inspectionRouter.post("/:id/extract", extractController);
