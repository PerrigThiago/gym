import { z } from "zod";

export const createPlanSchema = z.object({
    nombre_plan: z.string().min(1, "El nombre del plan es obligatorio"),
    dias_semana: z.coerce.number().int().positive("Los dias por semana deben ser mayor a 0"),
    precio: z.coerce.number().positive("El precio debe ser mayor a 0"),
});

export const updatePlanSchema = createPlanSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        message: "Debe enviar al menos un campo para actualizar",
    });
