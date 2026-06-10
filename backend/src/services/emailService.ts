import { emailConfig, resend } from "../config/email";

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

export const sendVerificationEmail = async (
    to: string,
    nombre: string,
    verificationToken: string
) => {
    const verificationUrl = `${emailConfig.frontendUrl}/verify-email?token=${verificationToken}`;
    const safeNombre = escapeHtml(nombre);

    const { error } = await resend.emails.send({
        from: emailConfig.from,
        to: [to],
        subject: "Verifica tu email en Gym Admin",
        html: `
            <div style="font-family: Arial, sans-serif; color: #17202a; line-height: 1.5;">
                <h1 style="font-size: 24px;">Hola ${safeNombre}</h1>
                <p>Gracias por registrarte en Gym Admin.</p>
                <p>Para activar tu cuenta, confirma tu email con el siguiente boton:</p>
                <p>
                    <a href="${verificationUrl}" style="display: inline-block; padding: 12px 18px; background: #1f8a70; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700;">
                        Verificar email
                    </a>
                </p>
                <p>Este link vence en 24 horas.</p>
                <p>Si no creaste esta cuenta, podes ignorar este mensaje.</p>
            </div>
        `,
    });

    if (error) {
        throw new Error(
            `No se pudo enviar el email de verificacion: ${error.message}`
        );
    }
};
