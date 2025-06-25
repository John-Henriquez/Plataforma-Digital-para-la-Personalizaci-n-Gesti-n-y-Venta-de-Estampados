import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { inventoryMovementReportController } from "../controllers/inventoryMovementReport.controller.js";

const router = Router();

router.use(authenticateJwt);

router.get("/", isAdmin, inventoryMovementReportController.getInventoryMovementsReport);

export default router;
