import { Request, Response } from "express";
import {
    marcarSociosActivosComoPendientes,
    marcarSociosPendientesComoAtrasados,
} from "../services/reglaMensualService";

export const aplicarPendientesController = async (_req: Request, res: Response) => {
    try {
        const response = await marcarSociosActivosComoPendientes();

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            message: "No se pudo aplicar la regla de pendientes",
        });
    }
};

export const aplicarAtrasadosController = async (_req: Request, res: Response) => {
    try {
        const response = await marcarSociosPendientesComoAtrasados();

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            message: "No se pudo aplicar la regla de atrasados",
        });
    }
};
