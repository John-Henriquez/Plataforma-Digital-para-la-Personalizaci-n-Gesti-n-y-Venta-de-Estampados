"use strict";
import { Router } from "express";
import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";
import inventoryRoutes from "./inventory.routes.js";
//import sendMail from "./email.routes.js";

const router = Router();

router
    .use("/auth", authRoutes)
    .use("/user", userRoutes)
    .use("/inventory", inventoryRoutes);
    //.use("/sendMail", sendMail)
export default router;