import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = process.env.RESEND_FROM_EMAIL;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

if (!resendApiKey || !resendFromEmail) {
    throw new Error("Faltan variables de entorno de Resend");
}

export const resend = new Resend(resendApiKey);

export const emailConfig = {
    from: resendFromEmail,
    frontendUrl,
};
