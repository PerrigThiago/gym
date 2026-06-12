import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { loginSchema, registerSchema } from "../schemas/authSchemas";
import { supabase } from "../config/supabase";

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export const registrarUsuario = async (data: RegisterData) => {
    const passwordHash = await bcrypt.hash(data.password, 10);

    let usuarioCreado;
    let error;

    try {
        const result = await supabase
            .from("usuario")
            .insert({
                usuario: data.usuario,
                nombre: data.nombre,
                password_hash: passwordHash,
            })
            .select("id_usuario, usuario, nombre")
            .single();

        usuarioCreado = result.data;
        error = result.error;
    } catch (fetchError) {
        console.error("No se pudo conectar con Supabase al registrar usuario:", fetchError);
        throw new Error(
            "No se pudo conectar con Supabase. Verifica tu conexion a internet y reinicia el backend desde una terminal normal."
        );
    }

    if (error?.code === "23505") {
        throw new Error("El usuario ya existe");
    }

    if (error) {
        console.error("Error de Supabase al registrar usuario:", error);
        throw new Error(
            `No se pudo registrar el usuario: ${error.message}`
        );
    }

    if (!usuarioCreado) {
        throw new Error("No se pudo registrar el usuario");
    }

    return {
        usuario: usuarioCreado,
        message: "Usuario registrado. Ya podes iniciar sesion.",
    };
};

export const loginUsuario = async (data: LoginData) => {
    const { data: usuarioEncontrado, error } = await supabase
        .from("usuario")
        .select("id_usuario, usuario, password_hash, nombre")
        .eq("usuario", data.usuario)
        .single();

    if (error || !usuarioEncontrado) {
        if (error) {
            console.error("Error de Supabase al buscar usuario:", error);
        }

        throw new Error("Usuario o password incorrectos");
    }

    const passwordValido = await bcrypt.compare(
        data.password,
        usuarioEncontrado.password_hash
    );

    if (!passwordValido) {
        throw new Error("Usuario o password incorrectos");
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        throw new Error("Falta JWT_SECRET en variables de entorno");
    }

    const token = jwt.sign(
        {
            id_usuario: usuarioEncontrado.id_usuario,
            usuario: usuarioEncontrado.usuario,
        },
        jwtSecret,
        {
            expiresIn: "1d",
        }
    );

    return {
        token,
        usuario: {
            id_usuario: usuarioEncontrado.id_usuario,
            usuario: usuarioEncontrado.usuario,
            nombre: usuarioEncontrado.nombre,
        },
    };
};
