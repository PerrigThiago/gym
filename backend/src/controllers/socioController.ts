import { Request, Response } from "express";
import { cambiarPlanSchema, createSocioSchema, updateSocioSchema } from "../schemas/socioSchema";
import {
    actualizarSocio,
    cambiarPlanSocio,
    crearSocio,
    desactivarSocio,
    listarHistorialPlanesSocio,
    listarSocios,
    obtenerSocioPorId,
} from "../services/socioService";

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

export const listarSociosController = async (_req: Request, res: Response) => {
    try {
        const response = await listarSocios();

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            message: "No se pudieron obtener los socios",
        });
    }
};

export const obtenerSocioController = async (req: Request, res: Response) => {
    const idSocio = parseIdParam(req.params.id_socio ?? req.params.id);

    if (!idSocio) {
        return res.status(400).json({
            message: "ID de socio invalido",
        });
    }

    try {
        const response = await obtenerSocioPorId(idSocio);

        return res.status(200).json(response);
    } catch (error) {
        return res.status(404).json({
            message: "Socio no encontrado",
        });
    }
};

export const crearSocioController = async (req: Request, res: Response) => {
    const idUsuario = getIdUsuarioFromRequest(req);

    if (!idUsuario) {
        return res.status(401).json({
            message: "Usuario no autenticado",
        });
    }

    const result = createSocioSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Datos invalidos",
            errors: result.error.issues,
        });
    }

    try {
        const response = await crearSocio(result.data, idUsuario);

        return res.status(201).json(response);
    } catch (error) {
        if (error instanceof Error && error.message === "El DNI ya existe") {
            return res.status(409).json({
                message: error.message,
            });
        }

        return res.status(400).json({
            message: "No se pudo crear el socio",
        });
    }
};

export const actualizarSocioController = async (req: Request, res: Response) => {
    const idSocio = parseIdParam(req.params.id_socio ?? req.params.id);

    if (!idSocio) {
        return res.status(400).json({
            message: "ID de socio invalido",
        });
    }

    const result = updateSocioSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Datos invalidos",
            errors: result.error.issues,
        });
    }

    try {
        const response = await actualizarSocio(idSocio, result.data);

        return res.status(200).json(response);
    } catch (error) {
        if (error instanceof Error && error.message === "El DNI ya existe") {
            return res.status(409).json({
                message: error.message,
            });
        }

        return res.status(404).json({
            message: "Socio no encontrado",
        });
    }
};

export const listarHistorialPlanesSocioController = async (req: Request, res: Response) => {
    const idSocio = parseIdParam(req.params.id_socio ?? req.params.id);

    if (!idSocio) {
        return res.status(400).json({
            message: "ID de socio invalido",
        });
    }

    try {
        const response = await listarHistorialPlanesSocio(idSocio);

        return res.status(200).json(response);
    } catch (error) {
        return res.status(400).json({
            message: "No se pudo obtener el historial de planes",
        });
    }
};

export const cambiarPlanSocioController = async (req: Request, res: Response) => {
    const idSocio = parseIdParam(req.params.id_socio ?? req.params.id);

    if (!idSocio) {
        return res.status(400).json({
            message: "ID de socio invalido",
        });
    }

    const result = cambiarPlanSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Datos invalidos",
            errors: result.error.issues,
        });
    }

    try {
        const idUsuario = getIdUsuarioFromRequest(req) ?? undefined;
        const response = await cambiarPlanSocio(idSocio, result.data.id_plan, idUsuario);

        return res.status(200).json(response);
    } catch (error) {
        if (error instanceof Error && error.message === "El socio ya tiene ese plan") {
            return res.status(409).json({
                message: error.message,
            });
        }

        return res.status(400).json({
            message: "No se pudo cambiar el plan del socio",
        });
    }
};

export const desactivarSocioController = async (req: Request, res: Response) => {
    const idSocio = parseIdParam(req.params.id_socio ?? req.params.id);

    if (!idSocio) {
        return res.status(400).json({
            message: "ID de socio invalido",
        });
    }

    try {
        const idUsuario = getIdUsuarioFromRequest(req) ?? undefined;
        const response = await desactivarSocio(idSocio, idUsuario);

        return res.status(200).json(response);
    } catch (error) {
        return res.status(404).json({
            message: "Socio no encontrado",
        });
    }
};
