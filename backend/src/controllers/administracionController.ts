import { Request, Response } from "express";
import {
    listarAlertas,
    listarEventosPorSocio,
    listarEventosRecientes,
    resolverAlerta,
} from "../services/administracionService";

const parseIdParam = (id: unknown) => {
    if (typeof id !== "string") {
        return null;
    }

    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId <= 0) {
        return null;
    }

    return numericId;
};

const getIdUsuarioFromRequest = (req: Request) => {
    const user = (req as any).user;

    if (!user || typeof user.id_usuario !== "number") {
        return null;
    }

    return user.id_usuario;
};

export const listarAlertasController = async (req: Request, res: Response) => {
    const estado = typeof req.query.estado === "string" ? req.query.estado : "Pendiente";

    try {
        const response = await listarAlertas(estado);

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            message: "No se pudieron obtener las alertas",
        });
    }
};

export const resolverAlertaController = async (req: Request, res: Response) => {
    const idAlerta = parseIdParam(req.params.id_alerta);
    const idUsuario = getIdUsuarioFromRequest(req);

    if (!idAlerta) {
        return res.status(400).json({
            message: "ID de alerta invalido",
        });
    }

    if (!idUsuario) {
        return res.status(401).json({
            message: "Usuario no autenticado",
        });
    }

    try {
        const response = await resolverAlerta(idAlerta, idUsuario);

        return res.status(200).json(response);
    } catch (error) {
        return res.status(400).json({
            message: "No se pudo resolver la alerta",
        });
    }
};

export const listarEventosController = async (_req: Request, res: Response) => {
    try {
        const response = await listarEventosRecientes();

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            message: "No se pudieron obtener los eventos",
        });
    }
};

export const listarEventosSocioController = async (req: Request, res: Response) => {
    const idSocio = parseIdParam(req.params.id_socio);

    if (!idSocio) {
        return res.status(400).json({
            message: "ID de socio invalido",
        });
    }

    try {
        const response = await listarEventosPorSocio(idSocio);

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            message: "No se pudieron obtener los eventos del socio",
        });
    }
};
