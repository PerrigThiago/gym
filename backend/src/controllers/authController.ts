import { Request, Response } from "express";
import { loginSchema, registerSchema } from "../schemas/authSchemas";
import {
    loginUsuario,
    registrarUsuario,
} from "../services/authService";

export const registerController = async (req: Request, res: Response) => {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Datos invalidos",
            errors: result.error.issues,
        });
    }

    try {
        const response = await registrarUsuario(result.data);

        return res.status(201).json(response);

    } catch (error) {
        console.error("registerController error:", error);
        
        if (error instanceof Error && error.message === "El usuario ya existe") {
            return res.status(409).json({
                message: error.message,
            });
        }

        return res.status(400).json({
            message: error instanceof Error ? error.message : "No se pudo registrar el usuario",
        });
    }
};

export const loginController = async (req: Request, res: Response) => {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Datos invalidos",
            errors: result.error.issues,
        });
    }

    try {
        const response = await loginUsuario(result.data);

        return res.status(200).json(response);
    } catch (error) {
        console.error("loginController error:", error);

        return res.status(401).json({
            message: "Usuario o password incorrectos",
        });
    }
};
