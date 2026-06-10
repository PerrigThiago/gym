import { Request, Response } from "express";
import { loginSchema, registerSchema, resendVerificationSchema } from "../schemas/authSchemas";
import {
    loginUsuario,
    reenviarVerificacionEmail,
    registrarUsuario,
    verificarEmailUsuario,
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
        
        if (error instanceof Error && error.message === "El usuario o email ya existe") {
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

        if (error instanceof Error && error.message === "Email no verificado") {
            return res.status(403).json({
                message: "Debes verificar tu email antes de iniciar sesion",
            });
        }

        return res.status(401).json({
            message: "Email o password incorrectos",
        });
    }
};

export const verifyEmailController = async (req: Request, res: Response) => {
    const token = typeof req.query.token === "string" ? req.query.token : "";

    if (!token) {
        return res.status(400).json({
            message: "Token de verificacion requerido",
        });
    }

    try {
        const response = await verificarEmailUsuario(token);

        return res.status(200).json(response);
    } catch (error) {
        console.error("verifyEmailController error:", error);

        return res.status(400).json({
            message: error instanceof Error ? error.message : "No se pudo verificar el email",
        });
    }
};

export const resendVerificationController = async (req: Request, res: Response) => {
    const result = resendVerificationSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Datos invalidos",
            errors: result.error.issues,
        });
    }

    try {
        const response = await reenviarVerificacionEmail(result.data);

        return res.status(200).json(response);
    } catch (error) {
        console.error("resendVerificationController error:", error);

        return res.status(502).json({
            message:
                error instanceof Error
                    ? error.message
                    : "No se pudo reenviar el email de verificacion",
        });
    }
};
