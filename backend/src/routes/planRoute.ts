import { Router } from "express";
import {
    actualizarPlanController,
    crearPlanController,
    listarPlanesController,
    obtenerPlanController,
} from "../controllers/planController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/", listarPlanesController);
router.get("/:id_plan", obtenerPlanController);
router.post("/", crearPlanController);
router.put("/:id_plan", actualizarPlanController);

export default router;
