export type AuthMode = "login" | "register";
export type MetodoPago = "Efectivo" | "MercadoPago";
export type DashboardTab = "socios" | "pagos" | "planes";

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
