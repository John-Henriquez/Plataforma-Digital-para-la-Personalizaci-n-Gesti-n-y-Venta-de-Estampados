"use strict";
import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import {
  createItemStock,
  createItemType,
  getItemStock,
  getItemStockPublic,
} from "../controllers/inventory.controller.js";

const router = Router();

router.get("/public/stocks", getItemStockPublic);

router.use(authenticateJwt);

router
  .post("/type", isAdmin, createItemType)
  .get("/type/stock", getItemStock)
  .post("/type/stock", isAdmin, createItemStock);


export default router;
