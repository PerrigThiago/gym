import { Router } from "express";
import {
    listarPagosController,
    listarPagosPorSocioController,
    obtenerPagoController,
    registrarPagoController,
} from "../controllers/pagoController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/", listarPagosController);
router.get("/socio/:id_socio", listarPagosPorSocioController);
router.get("/:id_pago", obtenerPagoController);
router.post("/", registrarPagoController);

export default router;
