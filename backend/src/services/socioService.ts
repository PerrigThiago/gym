import { z } from "zod";
import { supabase } from "../config/supabase";
import { createSocioSchema, updateSocioSchema } from "../schemas/socioSchema";

type CreateSocioData = z.infer<typeof createSocioSchema>;
type UpdateSocioData = z.infer<typeof updateSocioSchema>;

const SOCIO_SELECT = [
    "id_socio",
    "nombre",
    "apellido",
    "dni",
    "fecha_ingreso",
    "estado_pago",
    "estado_socio",
    "id_plan",
    "id_usuario",
    "created_at",
].join(", ");

const HISTORIAL_PLAN_SELECT = [
    "id_historial",
    "id_socio",
    "id_plan",
    "fecha_inicio",
    "fecha_fin",
    "created_at",
].join(", ");

export const listarSocios = async () => {
    const { data, error } = await supabase
        .from("socio")
        .select(SOCIO_SELECT)
        .order("id_socio", { ascending: true });

    if (error) {
        throw new Error("No se pudieron obtener los socios");
    }

    return {
        socios: data,
    };
};

export const obtenerSocioPorId = async (idSocio: number) => {
    const { data, error } = await supabase
        .from("socio")
        .select(SOCIO_SELECT)
        .eq("id_socio", idSocio)
        .single();

    if (error || !data) {
        throw new Error("Socio no encontrado");
    }

    return {
        socio: data,
    };
};

export const crearSocio = async (data: CreateSocioData, idUsuario: number) => {
    const fechaIngreso = data.fecha_ingreso ?? new Date().toISOString().slice(0, 10);

    const { data: socioCreado, error } = await supabase
        .from("socio")
        .insert({
            nombre: data.nombre,
            apellido: data.apellido,
            dni: data.dni,
            fecha_ingreso: fechaIngreso,
            estado_pago: data.estado_pago,
            estado_socio: data.estado_socio,
            id_plan: data.id_plan,
            id_usuario: idUsuario,
        })
        .select(SOCIO_SELECT)
        .single();

    if (error?.code === "23505") {
        throw new Error("El DNI ya existe");
    }

    if (error || !socioCreado) {
        throw new Error("No se pudo crear el socio");
    }

    const { error: historialError } = await supabase
        .from("socio_plan_historial")
        .insert({
            id_socio: socioCreado.id_socio,
            id_plan: data.id_plan,
            fecha_inicio: fechaIngreso,
            fecha_fin: null,
        });

    if (historialError) {
        throw new Error("No se pudo crear el historial del plan");
    }

    return {
        socio: socioCreado,
    };
};

export const actualizarSocio = async (idSocio: number, data: UpdateSocioData) => {
    const { data: socioActualizado, error } = await supabase
        .from("socio")
        .update(data)
        .eq("id_socio", idSocio)
        .select(SOCIO_SELECT)
        .single();

    if (error?.code === "23505") {
        throw new Error("El DNI ya existe");
    }

    if (error || !socioActualizado) {
        throw new Error("Socio no encontrado");
    }

    return {
        socio: socioActualizado,
    };
};

export const listarHistorialPlanesSocio = async (idSocio: number) => {
    const { data, error } = await supabase
        .from("socio_plan_historial")
        .select(HISTORIAL_PLAN_SELECT)
        .eq("id_socio", idSocio)
        .order("fecha_inicio", { ascending: false });

    if (error) {
        throw new Error("No se pudo obtener el historial de planes");
    }

    return {
        historial: data,
    };
};

export const cambiarPlanSocio = async (idSocio: number, idPlan: number) => {
    const { data: socioActual, error: socioError } = await supabase
        .from("socio")
        .select(SOCIO_SELECT)
        .eq("id_socio", idSocio)
        .single();

    if (socioError || !socioActual) {
        throw new Error("Socio no encontrado");
    }

    if (socioActual.id_plan === idPlan) {
        throw new Error("El socio ya tiene ese plan");
    }

    const fechaCambio = new Date().toISOString().slice(0, 10);

    const { error: cerrarHistorialError } = await supabase
        .from("socio_plan_historial")
        .update({ fecha_fin: fechaCambio })
        .eq("id_socio", idSocio)
        .is("fecha_fin", null);

    if (cerrarHistorialError) {
        throw new Error("No se pudo cerrar el historial anterior");
    }

    const { data: socioActualizado, error: actualizarSocioError } = await supabase
        .from("socio")
        .update({ id_plan: idPlan })
        .eq("id_socio", idSocio)
        .select(SOCIO_SELECT)
        .single();

    if (actualizarSocioError || !socioActualizado) {
        throw new Error("No se pudo actualizar el plan del socio");
    }

    const { data: historialCreado, error: crearHistorialError } = await supabase
        .from("socio_plan_historial")
        .insert({
            id_socio: idSocio,
            id_plan: idPlan,
            fecha_inicio: fechaCambio,
            fecha_fin: null,
        })
        .select(HISTORIAL_PLAN_SELECT)
        .single();

    if (crearHistorialError || !historialCreado) {
        throw new Error("No se pudo crear el nuevo historial del plan");
    }

    return {
        socio: socioActualizado,
        historial: historialCreado,
    };
};

export const desactivarSocio = async (idSocio: number) => {
    const { data, error } = await supabase
        .from("socio")
        .update({ estado_socio: "Inactivo" })
        .eq("id_socio", idSocio)
        .select(SOCIO_SELECT)
        .single();

    if (error || !data) {
        throw new Error("Socio no encontrado");
    }

    return {
        socio: data,
    };
};
