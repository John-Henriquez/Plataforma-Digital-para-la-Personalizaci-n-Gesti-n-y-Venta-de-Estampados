"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import {
  createItemStock,
  createItemType,
  deleteItemStock,
  getItemStock,
  getItemStockPublic,
  getItemTypes,
  updateItemStock,
} from "../controllers/inventory.controller.js";

const router = Router();

router.get("/public/stocks", getItemStockPublic);

router.use(authenticateJwt);

router
  .post("/type", isAdmin, createItemType)
  .get("/type", getItemTypes)
  .get("/type/stock", getItemStock)
  .put("/type/stock", isAdmin, updateItemStock)
  .post("/type/stock", isAdmin, createItemStock)
  .delete("/type/stock", isAdmin, deleteItemStock);


export default router;
