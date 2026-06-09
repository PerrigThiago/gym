import { z } from "zod";
import { supabase } from "../config/supabase";
import { createPlanSchema, updatePlanSchema } from "../schemas/planSchema";

type CreatePlanData = z.infer<typeof createPlanSchema>;
type UpdatePlanData = z.infer<typeof updatePlanSchema>;

const PLAN_SELECT = "id_plan, nombre_plan, dias_semana, precio";

export const listarPlanes = async () => {
    const { data, error } = await supabase
        .from("plan")
        .select(PLAN_SELECT)
        .order("id_plan", { ascending: true });

    if (error) {
        throw new Error("No se pudieron obtener los planes");
    }

    return {
        planes: data,
    };
};

export const obtenerPlanPorId = async (idPlan: number) => {
    const { data, error } = await supabase
        .from("plan")
        .select(PLAN_SELECT)
        .eq("id_plan", idPlan)
        .single();

    if (error || !data) {
        throw new Error("Plan no encontrado");
    }

    return {
        plan: data,
    };
};

export const crearPlan = async (data: CreatePlanData) => {
    const { data: planCreado, error } = await supabase
        .from("plan")
        .insert(data)
        .select(PLAN_SELECT)
        .single();

    if (error || !planCreado) {
        throw new Error("No se pudo crear el plan");
    }

    return {
        plan: planCreado,
    };
};

export const actualizarPlan = async (idPlan: number, data: UpdatePlanData) => {
    const { data: planActualizado, error } = await supabase
        .from("plan")
        .update(data)
        .eq("id_plan", idPlan)
        .select(PLAN_SELECT)
        .single();

    if (error || !planActualizado) {
        throw new Error("Plan no encontrado");
    }

    return {
        plan: planActualizado,
    };
};
