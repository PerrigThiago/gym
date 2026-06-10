import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { loginSchema, registerSchema, resendVerificationSchema } from "../schemas/authSchemas";
import { supabase } from "../config/supabase";
import { sendVerificationEmail } from "./emailService";

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;
type ResendVerificationData = z.infer<typeof resendVerificationSchema>;

const createVerificationToken = () => crypto.randomBytes(32).toString("hex");

const hashVerificationToken = (token: string) =>
    crypto.createHash("sha256").update(token).digest("hex");

const getVerificationExpiration = () => {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    return expiresAt.toISOString();
};

const sendUsuarioVerificationEmail = async (usuario: {
    email: string;
    nombre: string;
    id_usuario: number;
}) => {
    const verificationToken = createVerificationToken();
    const verificationTokenHash = hashVerificationToken(verificationToken);

    const { error } = await supabase
        .from("usuario")
        .update({
            email_verification_token_hash: verificationTokenHash,
            email_verification_expires_at: getVerificationExpiration(),
        })
        .eq("id_usuario", usuario.id_usuario);

    if (error) {
        throw new Error("No se pudo preparar la verificacion de email");
    }

    await sendVerificationEmail(usuario.email, usuario.nombre, verificationToken);
};

export const registrarUsuario = async (data: RegisterData) => {
    const passwordHash = await bcrypt.hash(data.password, 10);
    const verificationToken = createVerificationToken();
    const verificationTokenHash = hashVerificationToken(verificationToken);

    let usuarioCreado;
    let error;

    try {
        const result = await supabase
            .from("usuario")
            .insert({
                usuario: data.usuario,
                nombre: data.nombre,
                email: data.email.toLowerCase(),
                email_verified: false,
                email_verification_token_hash: verificationTokenHash,
                email_verification_expires_at: getVerificationExpiration(),
                password_hash: passwordHash,
            })
            .select("id_usuario, usuario, nombre, email, email_verified")
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
        throw new Error("El usuario o email ya existe");
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

    let emailSent = true;

    try {
        await sendVerificationEmail(usuarioCreado.email, usuarioCreado.nombre, verificationToken);
    } catch (error) {
        emailSent = false;
        console.error("Error al enviar email de verificacion:", error);
    }

    return {
        usuario: usuarioCreado,
        email_sent: emailSent,
        message: emailSent
            ? "Usuario registrado. Revisa tu email para verificar la cuenta."
            : "Usuario registrado, pero no se pudo enviar el email de verificacion. Revisa Resend y usa reenviar verificacion.",
    };
};

export const loginUsuario = async (data: LoginData) => {
    const { data: usuarioEncontrado, error } = await supabase
        .from("usuario")
        .select("id_usuario, usuario, email, email_verified, password_hash, nombre")
        .eq("email", data.email.toLowerCase())
        .single();

    if (error || !usuarioEncontrado) {
        if (error) {
            console.error("Error de Supabase al buscar usuario por email:", error);
        }

        throw new Error("Email o password incorrectos");
    }

    const passwordValido = await bcrypt.compare(
        data.password,
        usuarioEncontrado.password_hash
    );

    if (!passwordValido) {
        throw new Error("Email o password incorrectos");
    }

    if (!usuarioEncontrado.email_verified) {
        throw new Error("Email no verificado");
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        throw new Error("Falta JWT_SECRET en variables de entorno");
    }

    const token = jwt.sign(
        {
            id_usuario: usuarioEncontrado.id_usuario,
            usuario: usuarioEncontrado.usuario,
            email: usuarioEncontrado.email,
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
            email: usuarioEncontrado.email,
            nombre: usuarioEncontrado.nombre,
        },
    };
};

export const verificarEmailUsuario = async (token: string) => {
    const tokenHash = hashVerificationToken(token);

    const { data: usuarioEncontrado, error } = await supabase
        .from("usuario")
        .select("id_usuario, email_verification_expires_at")
        .eq("email_verification_token_hash", tokenHash)
        .single();

    if (error || !usuarioEncontrado) {
        throw new Error("Token de verificacion invalido");
    }

    const expiresAt = new Date(usuarioEncontrado.email_verification_expires_at);

    if (Number.isNaN(expiresAt.getTime()) || expiresAt < new Date()) {
        throw new Error("Token de verificacion vencido");
    }

    const { error: updateError } = await supabase
        .from("usuario")
        .update({
            email_verified: true,
            email_verification_token_hash: null,
            email_verification_expires_at: null,
        })
        .eq("id_usuario", usuarioEncontrado.id_usuario);

    if (updateError) {
        throw new Error("No se pudo verificar el email");
    }

    return {
        message: "Email verificado correctamente. Ya podes iniciar sesion.",
    };
};

export const reenviarVerificacionEmail = async (data: ResendVerificationData) => {
    const { data: usuarioEncontrado, error } = await supabase
        .from("usuario")
        .select("id_usuario, nombre, email, email_verified")
        .eq("email", data.email.toLowerCase())
        .single();

    if (error || !usuarioEncontrado) {
        return {
            message: "Si el email existe y no esta verificado, enviaremos un nuevo link.",
        };
    }

    if (!usuarioEncontrado.email_verified) {
        await sendUsuarioVerificationEmail(usuarioEncontrado);
    }

    return {
        message: "Si el email existe y no esta verificado, enviaremos un nuevo link.",
    };
};
