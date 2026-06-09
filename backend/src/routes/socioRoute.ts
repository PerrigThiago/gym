import { Router } from "express";
import {
    actualizarSocioController,
    crearSocioController,
    desactivarSocioController,
    listarSociosController,
    obtenerSocioController,
} from "../controllers/socioController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/", listarSociosController);
router.get("/:id_socio", obtenerSocioController);
router.post("/", crearSocioController);
router.put("/:id_socio", actualizarSocioController);
router.delete("/:id_socio", desactivarSocioController);

export default router;
