import { z } from "zod";

export const estadoPagoSchema = z.enum(["Pago", "Pendiente", "Atrasado"]);
export const estadoSocioSchema = z.enum(["Activo", "Inactivo"]);

export const createSocioSchema = z.object({
    nombre: z.string().min(1, "El nombre es obligatorio"),
    apellido: z.string().min(1, "El apellido es obligatorio"),
    dni: z.string().min(1, "El DNI es obligatorio"),
    fecha_ingreso: z.string().date().optional(),
    estado_pago: estadoPagoSchema.default("Pendiente"),
    estado_socio: estadoSocioSchema.default("Activo"),
    id_plan: z.coerce.number().int().positive("El plan es obligatorio"),
});

export const cambiarPlanSchema = z.object({
    id_plan: z.coerce.number().int().positive("El plan es obligatorio"),
});

export const updateSocioSchema = z.object({
    nombre: z.string().min(1, "El nombre es obligatorio").optional(),
    apellido: z.string().min(1, "El apellido es obligatorio").optional(),
    dni: z.string().min(1, "El DNI es obligatorio").optional(),
    fecha_ingreso: z.string().date().optional(),
    estado_pago: estadoPagoSchema.optional(),
    estado_socio: estadoSocioSchema.optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "Debe enviar al menos un campo para actualizar",
});
