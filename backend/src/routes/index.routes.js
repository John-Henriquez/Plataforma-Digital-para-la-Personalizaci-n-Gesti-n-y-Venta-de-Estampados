"use strict";
import { Router } from "express";
import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";
import itemTypeRoutes from "./itemType.routes.js";
import itemStockRoutes from "./itemStock.routes.js";
import inventoryMovementRoutes from "./inventoryMovement.routes.js";
//import sendMail from "./email.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);

router.use("/item-types", itemTypeRoutes);
router.use("/item-stocks", itemStockRoutes); 
// router.use("/sendMail", sendMail);
router.use("/reports/inventory-movements", inventoryMovementRoutes);

export default router;