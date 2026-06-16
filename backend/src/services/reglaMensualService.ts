import { supabase } from "../config/supabase";
import {
    crearAlertaSegura,
    registrarEventoSeguro,
    registrarReglaEjecucionSeguro,
} from "./administracionService";

const SOCIO_SELECT = [
    "id_socio",
    "nombre",
    "apellido",
    "dni",
    "estado_pago",
    "estado_socio",
    "id_plan",
].join(", ");

type SocioReglaRow = {
    id_socio: number;
    nombre: string;
    apellido: string;
};

export const marcarSociosActivosComoPendientes = async (idUsuario?: number) => {
    const { data, error } = await supabase
        .from("socio")
        .update({ estado_pago: "Pendiente" })
        .eq("estado_socio", "Activo")
        .select(SOCIO_SELECT);

    if (error) {
        throw new Error("No se pudo aplicar la regla de pendientes");
    }

    const sociosActualizados = (data ?? []) as unknown as SocioReglaRow[];

    await registrarReglaEjecucionSeguro({
        nombre_regla: "MARCAR_PENDIENTES",
        socios_afectados: sociosActualizados.length,
        id_usuario: idUsuario ?? null,
        metadata: {
            estado_pago: "Pendiente",
        },
    });

    await Promise.all(
        sociosActualizados.map((socio) =>
            registrarEventoSeguro({
                id_socio: socio.id_socio,
                id_usuario: idUsuario ?? null,
                tipo_evento: "ESTADO_PAGO_CAMBIADO",
                descripcion: "Regla mensual aplicada: socio marcado como Pendiente",
                metadata: {
                    estado_pago: "Pendiente",
                    regla: "MARCAR_PENDIENTES",
                },
            }),
        ),
    );

    return {
        socios_actualizados: sociosActualizados.length,
        socios: data,
    };
};

export const marcarSociosPendientesComoAtrasados = async (idUsuario?: number) => {
    const { data, error } = await supabase
        .from("socio")
        .update({ estado_pago: "Atrasado" })
        .eq("estado_socio", "Activo")
        .eq("estado_pago", "Pendiente")
        .select(SOCIO_SELECT);

    if (error) {
        throw new Error("No se pudo aplicar la regla de atrasados");
    }

    const sociosActualizados = (data ?? []) as unknown as SocioReglaRow[];

    await registrarReglaEjecucionSeguro({
        nombre_regla: "MARCAR_ATRASADOS",
        socios_afectados: sociosActualizados.length,
        id_usuario: idUsuario ?? null,
        metadata: {
            estado_pago: "Atrasado",
        },
    });

    await Promise.all(
        sociosActualizados.map(async (socio) => {
            await registrarEventoSeguro({
                id_socio: socio.id_socio,
                id_usuario: idUsuario ?? null,
                tipo_evento: "ESTADO_PAGO_CAMBIADO",
                descripcion: "Regla mensual aplicada: socio marcado como Atrasado",
                metadata: {
                    estado_pago: "Atrasado",
                    regla: "MARCAR_ATRASADOS",
                },
            });

            await crearAlertaSegura({
                id_socio: socio.id_socio,
                tipo_alerta: "PAGO_ATRASADO",
                titulo: "Socio con pago atrasado",
                descripcion: `${socio.apellido}, ${socio.nombre} figura con pago atrasado.`,
                prioridad: "Alta",
            });
        }),
    );

    return {
        socios_actualizados: sociosActualizados.length,
        socios: data,
    };
};
