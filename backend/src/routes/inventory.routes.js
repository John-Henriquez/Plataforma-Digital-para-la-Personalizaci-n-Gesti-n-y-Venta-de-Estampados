"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { inventoryController } from "../controllers/inventory.controller.js";

const router = Router();

// Rutas públicas
router.get("/public/stocks", inventoryController.getPublicStock);

// Rutas autenticadas
router.use(authenticateJwt);

// Rutas para tipos de producto
router.route("/types")
  .post(isAdmin, inventoryController.createItemType)
  .get(inventoryController.getItemTypes);
/*localhost:3000/inventory/types
{
  "name": "Taza Cerámica",
  "description": "Taza blanca para sublimación",
  "category": "object",
  "hasSizes": false,
  "printingMethods": ["sublimación"]
}*/

// Rutas para el inventario
router.route("/stocks")
  .get(inventoryController.getItemStock)
  .post(isAdmin, inventoryController.createItemStock);
/*localhost:3000/inventory/stocks
{
  "itemTypeId": 2,  // ID del tipo Taza
  "color": "Blanco",
  "hexColor": "#FFFFFF",
  "size": "N/A",  // o simplemente omitir el campo
  "quantity": 100,
  "price": 8500,
  "images": ["https://ejemplo.com/taza-blanca.jpg"],
  "minStock": 20
}
*/
router.route("/stocks/:id")
  .put(isAdmin, inventoryController.updateItemStock)
  .delete(isAdmin, inventoryController.deleteItemStock);

export default router;