import { Router } from "express";
import {
    listarAlertasController,
    listarEventosController,
    listarEventosSocioController,
    resolverAlertaController,
} from "../controllers/administracionController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/alertas", listarAlertasController);
router.patch("/alertas/:id_alerta/resolver", resolverAlertaController);
router.get("/eventos", listarEventosController);
router.get("/socios/:id_socio/eventos", listarEventosSocioController);

export default router;
