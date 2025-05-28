"use strict";
import { Router } from "express";
import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";
import recordRoutes from "./registro.routes.js";
import applicationRoutes from "./solicitud.routes.js";
import vehicleRoutes from "./vehiculo.routes.js";
import driversRoutes from "./conductor.routes.js";
import vehicleTypeRoutes from "./tipo_vehiculo.routes.js";
import assignmentRoutes from "./asignacion.routes.js";
import sendMail from "./email.routes.js";

const router = Router();

router
    .use("/auth", authRoutes)
    .use("/user", userRoutes)
    .use("/record", recordRoutes)
    .use("/application", applicationRoutes)
    .use("/vehicle", vehicleRoutes)
    .use("/driver", driversRoutes)
    .use("/tipos-vehiculos", vehicleTypeRoutes)
    .use("/sendMail", sendMail)
    .use("/asignacion", assignmentRoutes);
export default router;