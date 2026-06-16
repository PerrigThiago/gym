export type AuthMode = "login" | "register";
export type MetodoPago = "Efectivo" | "MercadoPago";
export type DashboardTab = "resumen" | "socios" | "pagos" | "planes" | "alertas";

export type Usuario = {
  id_usuario: number;
  usuario: string;
  nombre?: string;
};

export type Plan = {
  id_plan: number;
  nombre_plan: string;
  dias_semana: number;
  precio: number | string;
};

export type Socio = {
  id_socio: number;
  nombre: string;
  apellido: string;
  dni: string;
  fecha_ingreso: string;
  estado_pago: "Pago" | "Pendiente" | "Atrasado";
  estado_socio: "Activo" | "Inactivo";
  id_plan: number;
  id_usuario: number;
  created_at: string;
};

export type Pago = {
  id_pago: number;
  id_socio: number;
  id_usuario: number;
  fecha_pago: string;
  monto_pagado: number | string;
  metodo_pago: MetodoPago;
  comprobante?: string | null;
  observaciones?: string | null;
  created_at: string;
};

export type Alerta = {
  id_alerta: number;
  id_socio?: number | null;
  tipo_alerta: string;
  titulo: string;
  descripcion: string;
  prioridad: "Baja" | "Media" | "Alta";
  estado: "Pendiente" | "Resuelta" | "Ignorada";
  id_usuario_resolucion?: number | null;
  resolved_at?: string | null;
  created_at: string;
};

export type SocioEvento = {
  id_evento: number;
  id_socio?: number | null;
  id_usuario?: number | null;
  tipo_evento: string;
  descripcion: string;
  metadata?: Record<string, unknown>;
  created_at: string;
};

export type DashboardMessage = {
  type: "success" | "error";
  text: string;
} | null;

export type SocioForm = {
  nombre: string;
  apellido: string;
  dni: string;
  fecha_ingreso: string;
  id_plan: string;
};

export type PagoForm = {
  id_socio: string;
  monto_pagado: string;
  metodo_pago: MetodoPago;
  comprobante: string;
  observaciones: string;
};

export type CambioPlanForm = {
  id_socio: string;
  id_plan: string;
};
