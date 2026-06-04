import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { loginSchema } from "../schemas/authSchemas";
import { supabase } from "../utils/supabase";

type LoginData = z.infer<typeof loginSchema>;

export const loginUsuario = async (data: LoginData) => {
    const { data: usuarioEncontrado, error } = await supabase
        .from("usuario")
        .select("id_usuario, usuario, password_hash, nombre")
        .eq("usuario", data.usuario)
        .single();

    console.log(usuarioEncontrado, error);
};