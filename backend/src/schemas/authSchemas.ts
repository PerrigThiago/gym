import { z } from "zod";

export const loginSchema = z.object({
    email: z.email("El email no es valido"),
    password: z.string().min(1, "La password es obligatoria"),
});

export const registerSchema = z.object({
    usuario: z.string().min(1, "El usuario es obligatorio"),
    nombre: z.string().min(1, "El nombre es obligatorio"),
    email: z.email("El email no es valido"),
    password: z.string().min(6, "La password debe tener al menos 6 caracteres"),
});

export const resendVerificationSchema = z.object({
    email: z.email("El email no es valido"),
});
