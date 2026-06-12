import type { CambioPlanForm, PagoForm, SocioForm } from "../types/gym";

export const emptySocioForm: SocioForm = {
  nombre: "",
  apellido: "",
  dni: "",
  fecha_ingreso: "",
  id_plan: "",
};

export const emptyPagoForm: PagoForm = {
  id_socio: "",
  monto_pagado: "",
  metodo_pago: "Efectivo",
  comprobante: "",
  observaciones: "",
};

export const emptyCambioPlanForm: CambioPlanForm = {
  id_socio: "",
  id_plan: "",
};
