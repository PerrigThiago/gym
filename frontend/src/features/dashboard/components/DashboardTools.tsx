import { useMemo, useState } from "react";
import type { Dispatch, FormEventHandler, SetStateAction } from "react";
import { FiCreditCard, FiRepeat, FiSearch, FiUser } from "react-icons/fi";
import type {
  CambioPlanForm,
  DashboardTab,
  MetodoPago,
  PagoForm,
  Plan,
  Socio,
  SocioForm,
} from "../../../types/gym";
import { formatCurrency } from "../../../utils/formatters";

type DashboardToolsProps = {
  activeTab: DashboardTab;
  cambioPlanForm: CambioPlanForm;
  pagoForm: PagoForm;
  planes: Plan[];
  socioForm: SocioForm;
  sociosActivos: Socio[];
  onCambiarPlan: FormEventHandler<HTMLFormElement>;
  onCreateSocio: FormEventHandler<HTMLFormElement>;
  onRegistrarPago: FormEventHandler<HTMLFormElement>;
  onReglaMensual: (regla: "pendientes" | "atrasados") => void;
  setCambioPlanForm: Dispatch<SetStateAction<CambioPlanForm>>;
  setPagoForm: Dispatch<SetStateAction<PagoForm>>;
  setSocioForm: Dispatch<SetStateAction<SocioForm>>;
};

export function DashboardTools({
  activeTab,
  cambioPlanForm,
  pagoForm,
  planes,
  socioForm,
  sociosActivos,
  onCambiarPlan,
  onCreateSocio,
  onRegistrarPago,
  onReglaMensual,
  setCambioPlanForm,
  setPagoForm,
  setSocioForm,
}: DashboardToolsProps) {
  const [pagoSocioSearch, setPagoSocioSearch] = useState("");
  const selectedPagoSocio = useMemo(
    () => sociosActivos.find((socio) => String(socio.id_socio) === pagoForm.id_socio) ?? null,
    [pagoForm.id_socio, sociosActivos],
  );
  const selectedPagoPlan = selectedPagoSocio
    ? planes.find((plan) => plan.id_plan === selectedPagoSocio.id_plan) ?? null
    : null;
  const sociosPagoFiltrados = useMemo(() => {
    const search = pagoSocioSearch.trim().toLowerCase();

    if (!search) {
      return sociosActivos.slice(0, 8);
    }

    return sociosActivos
      .filter((socio) => {
        const plan = planes.find((item) => item.id_plan === socio.id_plan);

        return (
          socio.nombre.toLowerCase().includes(search) ||
          socio.apellido.toLowerCase().includes(search) ||
          socio.dni.toLowerCase().includes(search) ||
          (plan?.nombre_plan ?? "").toLowerCase().includes(search)
        );
      })
      .slice(0, 10);
  }, [pagoSocioSearch, planes, sociosActivos]);

  const handleSelectPagoSocio = (idSocio: number) => {
    const socio = sociosActivos.find((item) => item.id_socio === idSocio);
    const plan = socio ? planes.find((item) => item.id_plan === socio.id_plan) : null;

    setPagoForm({
      ...pagoForm,
      id_socio: String(idSocio),
      monto_pagado: plan ? String(plan.precio) : pagoForm.monto_pagado,
    });
    setPagoSocioSearch("");
  };

  if (activeTab === "alertas" || activeTab === "resumen") {
    return null;
  }

  if (activeTab === "pagos") {
    return (
      <section className="tools-grid single-tool">
        <form className="tool-panel" onSubmit={onRegistrarPago}>
          <div className="tool-header">
            <FiCreditCard />
            <h2>Registrar pago</h2>
          </div>
          <div className="payment-flow">
            <div className="member-search-panel">
              <label className="search-control payment-search">
                <FiSearch />
                <input
                  value={pagoSocioSearch}
                  onChange={(event) => setPagoSocioSearch(event.target.value)}
                  placeholder="Buscar socio por nombre, DNI o plan"
                />
              </label>

              <div className="member-result-list">
                {sociosPagoFiltrados.map((socio) => {
                  const plan = planes.find((item) => item.id_plan === socio.id_plan);

                  return (
                    <button
                      className={pagoForm.id_socio === String(socio.id_socio) ? "active" : ""}
                      key={socio.id_socio}
                      type="button"
                      onClick={() => handleSelectPagoSocio(socio.id_socio)}
                    >
                      <span>
                        <strong>
                          {socio.apellido}, {socio.nombre}
                        </strong>
                        <small>
                          DNI {socio.dni} | {plan?.nombre_plan ?? `Plan ${socio.id_plan}`}
                        </small>
                      </span>
                      <b>{plan ? formatCurrency(plan.precio) : "-"}</b>
                    </button>
                  );
                })}
                {sociosActivos.length === 0 && <p>No hay socios activos para cobrar.</p>}
                {sociosActivos.length > 0 && sociosPagoFiltrados.length === 0 && (
                  <p>No encontramos socios con esa busqueda.</p>
                )}
              </div>
            </div>

            <div className="selected-payment-panel">
              <div className="selected-member-card">
                <span>Socio seleccionado</span>
                {selectedPagoSocio ? (
                  <>
                    <strong>
                      {selectedPagoSocio.apellido}, {selectedPagoSocio.nombre}
                    </strong>
                    <small>
                      {selectedPagoPlan?.nombre_plan ?? `Plan ${selectedPagoSocio.id_plan}`} |{" "}
                      {selectedPagoPlan ? formatCurrency(selectedPagoPlan.precio) : "Sin precio"}
                    </small>
                  </>
                ) : (
                  <strong>Selecciona un socio</strong>
                )}
              </div>

              <div className="form-grid two-columns">
            <label>
              Monto
              <input
                type="number"
                min="1"
                value={pagoForm.monto_pagado}
                onChange={(event) =>
                  setPagoForm({ ...pagoForm, monto_pagado: event.target.value })
                }
                required
              />
            </label>
            <label>
              Metodo
              <select
                value={pagoForm.metodo_pago}
                onChange={(event) =>
                  setPagoForm({
                    ...pagoForm,
                    metodo_pago: event.target.value as MetodoPago,
                  })
                }
              >
                <option value="Efectivo">Efectivo</option>
                <option value="MercadoPago">MercadoPago</option>
              </select>
            </label>
            <label>
              Comprobante
              <input
                value={pagoForm.comprobante}
                onChange={(event) =>
                  setPagoForm({ ...pagoForm, comprobante: event.target.value })
                }
                placeholder="/uploads/comprobantes/pago_001.jpg"
              />
            </label>
            <label className="full-width">
              Observaciones
              <input
                value={pagoForm.observaciones}
                onChange={(event) =>
                  setPagoForm({ ...pagoForm, observaciones: event.target.value })
                }
              />
            </label>
              </div>
            </div>
          </div>
          <button className="primary-button compact" type="submit">
            Registrar pago
          </button>
        </form>
      </section>
    );
  }

  if (activeTab === "planes") {
    return (
      <section className="tools-grid single-tool">
        <div className="tool-panel">
          <div className="tool-header">
            <FiRepeat />
            <h2>Cambiar plan</h2>
          </div>
          <form className="form-grid two-columns" onSubmit={onCambiarPlan}>
            <label>
              Socio
              <select
                value={cambioPlanForm.id_socio}
                onChange={(event) =>
                  setCambioPlanForm({
                    ...cambioPlanForm,
                    id_socio: event.target.value,
                  })
                }
                required
              >
                <option value="">Seleccionar socio</option>
                {sociosActivos.map((socio) => (
                  <option key={socio.id_socio} value={socio.id_socio}>
                    {socio.apellido}, {socio.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Nuevo plan
              <select
                value={cambioPlanForm.id_plan}
                onChange={(event) =>
                  setCambioPlanForm({
                    ...cambioPlanForm,
                    id_plan: event.target.value,
                  })
                }
                required
              >
                <option value="">Seleccionar plan</option>
                {planes.map((plan) => (
                  <option key={plan.id_plan} value={plan.id_plan}>
                    {plan.nombre_plan}
                  </option>
                ))}
              </select>
            </label>
            <button className="secondary-button compact full-width" type="submit">
              Cambiar plan
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="tools-grid">
      <form className="tool-panel" onSubmit={onCreateSocio}>
        <div className="tool-header">
          <FiUser />
          <h2>Nuevo socio</h2>
        </div>
        <div className="form-grid two-columns">
          <label>
            Nombre
            <input
              value={socioForm.nombre}
              onChange={(event) => setSocioForm({ ...socioForm, nombre: event.target.value })}
              required
            />
          </label>
          <label>
            Apellido
            <input
              value={socioForm.apellido}
              onChange={(event) => setSocioForm({ ...socioForm, apellido: event.target.value })}
              required
            />
          </label>
          <label>
            DNI
            <input
              value={socioForm.dni}
              onChange={(event) => setSocioForm({ ...socioForm, dni: event.target.value })}
              required
            />
          </label>
          <label>
            Ingreso
            <input
              type="date"
              value={socioForm.fecha_ingreso}
              onChange={(event) =>
                setSocioForm({ ...socioForm, fecha_ingreso: event.target.value })
              }
            />
          </label>
          <label className="full-width">
            Plan
            <select
              value={socioForm.id_plan}
              onChange={(event) => setSocioForm({ ...socioForm, id_plan: event.target.value })}
              required
            >
              <option value="">Seleccionar plan</option>
              {planes.map((plan) => (
                <option key={plan.id_plan} value={plan.id_plan}>
                  {plan.nombre_plan} - {formatCurrency(plan.precio)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button className="primary-button compact" type="submit">
          Crear socio
        </button>
      </form>

      <div className="tool-panel">
        <div className="tool-header">
          <FiRepeat />
          <h2>Reglas mensuales</h2>
        </div>
        <p className="tool-description">
          Actualiza estados de pago para el cierre administrativo del mes.
        </p>
        <div className="rule-actions">
          <button
            className="outline-button"
            type="button"
            onClick={() => onReglaMensual("pendientes")}
          >
            Marcar pendientes
          </button>
          <button
            className="outline-button"
            type="button"
            onClick={() => onReglaMensual("atrasados")}
          >
            Marcar atrasados
          </button>
        </div>
      </div>
    </section>
  );
}
