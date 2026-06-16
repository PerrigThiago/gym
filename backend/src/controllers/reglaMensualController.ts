import { Request, Response } from "express";
import {
    marcarSociosActivosComoPendientes,
    marcarSociosPendientesComoAtrasados,
} from "../services/reglaMensualService";

const getIdUsuarioFromRequest = (req: Request) => {
    const user = (req as any).user;

    if (!user || typeof user.id_usuario !== "number") {
        return null;
    }

    return user.id_usuario;
};

export const aplicarPendientesController = async (req: Request, res: Response) => {
    try {
        const response = await marcarSociosActivosComoPendientes(
            getIdUsuarioFromRequest(req) ?? undefined,
        );

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            message: "No se pudo aplicar la regla de pendientes",
        });
    }
};

export const aplicarAtrasadosController = async (req: Request, res: Response) => {
    try {
        const response = await marcarSociosPendientesComoAtrasados(
            getIdUsuarioFromRequest(req) ?? undefined,
        );

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            message: "No se pudo aplicar la regla de atrasados",
        });
    }
};
