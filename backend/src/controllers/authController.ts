import { Request, Response } from "express";
import { loginSchema, registerSchema } from "../schemas/authSchemas";
import { loginUsuario, registrarUsuario } from "../services/authService";

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
        return res.status(400).json({
            message: "No se pudo registrar el usuario",
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
        return res.status(401).json({
            message: "Usuario o password incorrectos",
        });
    }
};