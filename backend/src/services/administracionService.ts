import { supabase } from "../config/supabase";

type CrearEventoData = {
    id_socio?: number | null;
    id_usuario?: number | null;
    tipo_evento: string;
    descripcion: string;
    metadata?: Record<string, unknown>;
};

type CrearAlertaData = {
    id_socio?: number | null;
    tipo_alerta: string;
    titulo: string;
    descripcion: string;
    prioridad?: "Baja" | "Media" | "Alta";
};

type RegistrarReglaData = {
    nombre_regla: string;
    socios_afectados: number;
    id_usuario?: number | null;
    metadata?: Record<string, unknown>;
};

const ALERTA_SELECT = [
    "id_alerta",
    "id_socio",
    "tipo_alerta",
    "titulo",
    "descripcion",
    "prioridad",
    "estado",
    "id_usuario_resolucion",
    "resolved_at",
    "created_at",
].join(", ");

const EVENTO_SELECT = [
    "id_evento",
    "id_socio",
    "id_usuario",
    "tipo_evento",
    "descripcion",
    "metadata",
    "created_at",
].join(", ");

export const registrarEvento = async (data: CrearEventoData) => {
    const { error } = await supabase
        .from("socio_evento")
        .insert({
            id_socio: data.id_socio ?? null,
            id_usuario: data.id_usuario ?? null,
            tipo_evento: data.tipo_evento,
            descripcion: data.descripcion,
            metadata: data.metadata ?? {},
        });

    if (error) {
        throw new Error("No se pudo registrar el evento");
    }
};

export const registrarEventoSeguro = async (data: CrearEventoData) => {
    try {
        await registrarEvento(data);
    } catch (error) {
        console.error("Evento administrativo no registrado:", error);
    }
};

export const crearAlerta = async (data: CrearAlertaData) => {
    const { error } = await supabase
        .from("alerta")
        .insert({
            id_socio: data.id_socio ?? null,
            tipo_alerta: data.tipo_alerta,
            titulo: data.titulo,
            descripcion: data.descripcion,
            prioridad: data.prioridad ?? "Media",
            estado: "Pendiente",
        });

    if (error) {
        throw new Error("No se pudo crear la alerta");
    }
};

export const crearAlertaSegura = async (data: CrearAlertaData) => {
    try {
        await crearAlerta(data);
    } catch (error) {
        console.error("Alerta administrativa no creada:", error);
    }
};

export const listarAlertas = async (estado = "Pendiente") => {
    const query = supabase
        .from("alerta")
        .select(ALERTA_SELECT)
        .order("created_at", { ascending: false });

    if (estado !== "Todas") {
        query.eq("estado", estado);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error("No se pudieron obtener las alertas");
    }

    return {
        alertas: data,
    };
};

export const resolverAlerta = async (idAlerta: number, idUsuario: number) => {
    const { data, error } = await supabase
        .from("alerta")
        .update({
            estado: "Resuelta",
            id_usuario_resolucion: idUsuario,
            resolved_at: new Date().toISOString(),
        })
        .eq("id_alerta", idAlerta)
        .select(ALERTA_SELECT)
        .single();

    if (error || !data) {
        throw new Error("No se pudo resolver la alerta");
    }

    return {
        alerta: data,
    };
};

export const listarEventosRecientes = async () => {
    const { data, error } = await supabase
        .from("socio_evento")
        .select(EVENTO_SELECT)
        .order("created_at", { ascending: false })
        .limit(50);

    if (error) {
        throw new Error("No se pudieron obtener los eventos");
    }

    return {
        eventos: data,
    };
};

export const listarEventosPorSocio = async (idSocio: number) => {
    const { data, error } = await supabase
        .from("socio_evento")
        .select(EVENTO_SELECT)
        .eq("id_socio", idSocio)
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error("No se pudieron obtener los eventos del socio");
    }

    return {
        eventos: data,
    };
};

export const registrarReglaEjecucionSeguro = async (data: RegistrarReglaData) => {
    try {
        const { error } = await supabase
            .from("regla_ejecucion")
            .insert({
                nombre_regla: data.nombre_regla,
                socios_afectados: data.socios_afectados,
                id_usuario: data.id_usuario ?? null,
                metadata: data.metadata ?? {},
            });

        if (error) {
            throw error;
        }
    } catch (error) {
        console.error("Ejecucion de regla no registrada:", error);
    }
};
