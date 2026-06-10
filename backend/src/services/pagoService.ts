import { z } from "zod";
import { supabase } from "../config/supabase";
import { createPagoSchema } from "../schemas/pagoSchema";

type CreatePagoData = z.infer<typeof createPagoSchema>;

const PAGO_SELECT = [
    "id_pago",
    "id_socio",
    "id_usuario",
    "fecha_pago",
    "monto_pagado",
    "metodo_pago",
    "comprobante",
    "observaciones",
    "created_at",
].join(", ");

export const listarPagos = async () => {
    const { data, error } = await supabase
        .from("pago")
        .select(PAGO_SELECT)
        .order("fecha_pago", { ascending: false });

    if (error) {
        throw new Error("No se pudieron obtener los pagos");
    }

    return {
        pagos: data,
    };
};

export const obtenerPagoPorId = async (idPago: number) => {
    const { data, error } = await supabase
        .from("pago")
        .select(PAGO_SELECT)
        .eq("id_pago", idPago)
        .single();

    if (error || !data) {
        throw new Error("Pago no encontrado");
    }

    return {
        pago: data,
    };
};

export const listarPagosPorSocio = async (idSocio: number) => {
    const { data, error } = await supabase
        .from("pago")
        .select(PAGO_SELECT)
        .eq("id_socio", idSocio)
        .order("fecha_pago", { ascending: false });

    if (error) {
        throw new Error("No se pudieron obtener los pagos del socio");
    }

    return {
        pagos: data,
    };
};

export const registrarPago = async (data: CreatePagoData, idUsuario: number) => {
    const { data: pagoCreado, error } = await supabase
        .from("pago")
        .insert({
            id_socio: data.id_socio,
            id_usuario: idUsuario,
            fecha_pago: data.fecha_pago ?? new Date().toISOString(),
            monto_pagado: data.monto_pagado,
            metodo_pago: data.metodo_pago,
            comprobante: data.comprobante ?? null,
            observaciones: data.observaciones ?? null,
        })
        .select(PAGO_SELECT)
        .single();

    if (error || !pagoCreado) {
        throw new Error("No se pudo registrar el pago");
    }

    const { error: socioError } = await supabase
        .from("socio")
        .update({ estado_pago: "Pago" })
        .eq("id_socio", data.id_socio);

    if (socioError) {
        throw new Error("No se pudo actualizar el estado de pago del socio");
    }

    return {
        pago: pagoCreado,
    };
};
