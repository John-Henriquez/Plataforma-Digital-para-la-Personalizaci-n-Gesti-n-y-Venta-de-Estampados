import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { itemStockController } from "../controllers/itemStock.controller.js"; 

const router = Router();

// Rutas públicas
router.get("/public", itemStockController.getPublicStock);

// Rutas autenticadas
router.use(authenticateJwt);

// GET /api/item-stocks
router.get("/", itemStockController.getItemStock);

// POST /api/item-stocks (admin)
router.post("/", isAdmin, itemStockController.createItemStock);

// PUT /api/item-stocks/:id (admin)
router.put("/:id", isAdmin, itemStockController.updateItemStock);

// DELETE /api/item-stocks/:id (admin)
router.delete("/:id", isAdmin, itemStockController.deleteItemStock);

export default router;
