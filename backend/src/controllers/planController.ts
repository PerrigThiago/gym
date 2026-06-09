import { Request, Response } from "express";
import { createPlanSchema, updatePlanSchema } from "../schemas/planSchema";
import {
    actualizarPlan,
    crearPlan,
    listarPlanes,
    obtenerPlanPorId,
} from "../services/planService";

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

export const listarPlanesController = async (_req: Request, res: Response) => {
    try {
        const response = await listarPlanes();

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            message: "No se pudieron obtener los planes",
        });
    }
};

export const obtenerPlanController = async (req: Request, res: Response) => {
    const idPlan = parseIdParam(req.params.id_plan ?? req.params.id);

    if (!idPlan) {
        return res.status(400).json({
            message: "ID de plan invalido",
        });
    }

    try {
        const response = await obtenerPlanPorId(idPlan);

        return res.status(200).json(response);
    } catch (error) {
        return res.status(404).json({
            message: "Plan no encontrado",
        });
    }
};

export const crearPlanController = async (req: Request, res: Response) => {
    const result = createPlanSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Datos invalidos",
            errors: result.error.issues,
        });
    }

    try {
        const response = await crearPlan(result.data);

        return res.status(201).json(response);
    } catch (error) {
        return res.status(400).json({
            message: "No se pudo crear el plan",
        });
    }
};

export const actualizarPlanController = async (req: Request, res: Response) => {
    const idPlan = parseIdParam(req.params.id_plan ?? req.params.id);

    if (!idPlan) {
        return res.status(400).json({
            message: "ID de plan invalido",
        });
    }

    const result = updatePlanSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Datos invalidos",
            errors: result.error.issues,
        });
    }

    try {
        const response = await actualizarPlan(idPlan, result.data);

        return res.status(200).json(response);
    } catch (error) {
        return res.status(404).json({
            message: "Plan no encontrado",
        });
    }
};
