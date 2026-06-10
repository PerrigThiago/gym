import { supabase } from "../config/supabase";

const SOCIO_SELECT = [
    "id_socio",
    "nombre",
    "apellido",
    "dni",
    "estado_pago",
    "estado_socio",
    "id_plan",
].join(", ");

export const marcarSociosActivosComoPendientes = async () => {
    const { data, error } = await supabase
        .from("socio")
        .update({ estado_pago: "Pendiente" })
        .eq("estado_socio", "Activo")
        .select(SOCIO_SELECT);

    if (error) {
        throw new Error("No se pudo aplicar la regla de pendientes");
    }

    return {
        socios_actualizados: data?.length ?? 0,
        socios: data,
    };
};

export const marcarSociosPendientesComoAtrasados = async () => {
    const { data, error } = await supabase
        .from("socio")
        .update({ estado_pago: "Atrasado" })
        .eq("estado_socio", "Activo")
        .eq("estado_pago", "Pendiente")
        .select(SOCIO_SELECT);

    if (error) {
        throw new Error("No se pudo aplicar la regla de atrasados");
    }

    return {
        socios_actualizados: data?.length ?? 0,
        socios: data,
    };
};
