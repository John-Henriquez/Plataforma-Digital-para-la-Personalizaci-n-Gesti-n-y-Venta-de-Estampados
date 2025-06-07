"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import upload from "./../middlewares/uploadMiddleware.js";
import { inventoryController } from "../controllers/inventory.controller.js";

const router = Router();

// Rutas públicas
router.get("/public/stocks", inventoryController.getPublicStock);

// Rutas autenticadas
router.use(authenticateJwt);

// Rutas para tipos de producto
router.route("/types")
  .get(inventoryController.getItemTypes);

router.post(
  "/types",
  isAdmin,
  upload.single("baseImage"), 
  inventoryController.createItemType
);

// Rutas para el inventario
router.route("/stocks")
  .get(inventoryController.getItemStock)
  .post(isAdmin, inventoryController.createItemStock);

router.route("/stocks/:id")
  .put(isAdmin, inventoryController.updateItemStock)
  .delete(isAdmin, inventoryController.deleteItemStock);

export default router;