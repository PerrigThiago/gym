import { Router } from "express";
import {
    actualizarSocioController,
    cambiarPlanSocioController,
    crearSocioController,
    desactivarSocioController,
    listarHistorialPlanesSocioController,
    listarSociosController,
    obtenerSocioController,
} from "../controllers/socioController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/", listarSociosController);
router.get("/:id_socio/plan-historial", listarHistorialPlanesSocioController);
router.patch("/:id_socio/plan", cambiarPlanSocioController);
router.get("/:id_socio", obtenerSocioController);
router.post("/", crearSocioController);
router.put("/:id_socio", actualizarSocioController);
router.delete("/:id_socio", desactivarSocioController);

export default router;
