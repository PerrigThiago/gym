import { z } from "zod";

export const metodoPagoSchema = z.enum(["Efectivo", "MercadoPago"]);

export const createPagoSchema = z.object({
    id_socio: z.coerce.number().int().positive("El socio es obligatorio"),
    fecha_pago: z.string().datetime().optional(),
    monto_pagado: z.coerce.number().positive("El monto pagado debe ser mayor a 0"),
    metodo_pago: metodoPagoSchema,
    comprobante: z.string().optional(),
    observaciones: z.string().optional(),
});
