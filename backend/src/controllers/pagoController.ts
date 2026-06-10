import { Request, Response } from "express";
import { createPagoSchema } from "../schemas/pagoSchema";
import {
    listarPagos,
    listarPagosPorSocio,
    obtenerPagoPorId,
    registrarPago,
} from "../services/pagoService";

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

export const listarPagosController = async (_req: Request, res: Response) => {
    try {
        const response = await listarPagos();

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            message: "No se pudieron obtener los pagos",
        });
    }
};

export const obtenerPagoController = async (req: Request, res: Response) => {
    const idPago = parseIdParam(req.params.id_pago ?? req.params.id);

    if (!idPago) {
        return res.status(400).json({
            message: "ID de pago invalido",
        });
    }

    try {
        const response = await obtenerPagoPorId(idPago);

        return res.status(200).json(response);
    } catch (error) {
        return res.status(404).json({
            message: "Pago no encontrado",
        });
    }
};

export const listarPagosPorSocioController = async (req: Request, res: Response) => {
    const idSocio = parseIdParam(req.params.id_socio);

    if (!idSocio) {
        return res.status(400).json({
            message: "ID de socio invalido",
        });
    }

    try {
        const response = await listarPagosPorSocio(idSocio);

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            message: "No se pudieron obtener los pagos del socio",
        });
    }
};

export const registrarPagoController = async (req: Request, res: Response) => {
    const idUsuario = getIdUsuarioFromRequest(req);

    if (!idUsuario) {
        return res.status(401).json({
            message: "Usuario no autenticado",
        });
    }

    const result = createPagoSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Datos invalidos",
            errors: result.error.issues,
        });
    }

    try {
        const response = await registrarPago(result.data, idUsuario);

        return res.status(201).json(response);
    } catch (error) {
        return res.status(400).json({
            message: "No se pudo registrar el pago",
        });
    }
};
