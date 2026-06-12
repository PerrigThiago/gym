import { z } from "zod";

export const loginSchema = z.object({
    usuario: z.string().min(1, "El usuario es obligatorio"),
    password: z.string().min(1, "La password es obligatoria"),
});

export const registerSchema = z.object({
    usuario: z.string().min(1, "El usuario es obligatorio"),
    nombre: z.string().min(1, "El nombre es obligatorio"),
    password: z.string().min(6, "La password debe tener al menos 6 caracteres"),
});
