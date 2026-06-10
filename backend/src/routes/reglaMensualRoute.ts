import { Router } from "express";
import {
    aplicarAtrasadosController,
    aplicarPendientesController,
} from "../controllers/reglaMensualController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.post("/pendientes", aplicarPendientesController);
router.post("/atrasados", aplicarAtrasadosController);

export default router;
