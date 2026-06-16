import { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import type { Alerta, DashboardTab, Pago, Plan, Socio, SocioEvento } from "../../../types/gym";
import { formatCurrency, formatDate } from "../../../utils/formatters";

type SocioFilter = "todos" | "activos" | "pendientes" | "atrasados" | "inactivos";

const socioFilters: Array<{ label: string; value: SocioFilter }> = [
  { label: "Todos", value: "todos" },
  { label: "Activos", value: "activos" },
  { label: "Pendientes", value: "pendientes" },
  { label: "Atrasados", value: "atrasados" },
  { label: "Inactivos", value: "inactivos" },
];

type DashboardDataPanelProps = {
  activeTab: DashboardTab;
  alertas: Alerta[];
  deudaEstimada: number;
  ingresosHoy: number;
  ingresosMes: number;
  pagos: Pago[];
  pagosHoy: Pago[];
  pagosMes: Pago[];
  planById: Record<number, Plan>;
  planes: Plan[];
  selectedSocioId: number | null;
  socioEventos: SocioEvento[];
  socios: Socio[];
  onDesactivarSocio: (idSocio: number) => void;
  onResolverAlerta: (idAlerta: number) => void;
  onSelectSocio: (idSocio: number) => void;
  onTabChange: (tab: DashboardTab) => void;
};

export function DashboardDataPanel({
  activeTab,
  alertas,
  deudaEstimada,
  ingresosHoy,
  ingresosMes,
  pagos,
  pagosHoy,
  pagosMes,
  planById,
  planes,
  selectedSocioId,
  socioEventos,
  socios,
  onDesactivarSocio,
  onResolverAlerta,
  onSelectSocio,
  onTabChange,
}: DashboardDataPanelProps) {
  const [socioSearch, setSocioSearch] = useState("");
  const [socioFilter, setSocioFilter] = useState<SocioFilter>("todos");

  const selectedSocio = socios.find((socio) => socio.id_socio === selectedSocioId) ?? null;
  const pagosSocio = selectedSocio
    ? pagos.filter((pago) => pago.id_socio === selectedSocio.id_socio)
    : [];
  const totalPagadoSocio = pagosSocio.reduce(
    (total, pago) => total + Number(pago.monto_pagado),
    0,
  );
  const visibleSocios = useMemo(() => {
    const search = socioSearch.trim().toLowerCase();

    return socios.filter((socio) => {
      const matchesSearch =
        !search ||
        socio.nombre.toLowerCase().includes(search) ||
        socio.apellido.toLowerCase().includes(search) ||
        socio.dni.toLowerCase().includes(search) ||
        (planById[socio.id_plan]?.nombre_plan ?? "").toLowerCase().includes(search);

      if (!matchesSearch) {
        return false;
      }

      if (socioFilter === "activos") {
        return socio.estado_socio === "Activo";
      }

      if (socioFilter === "pendientes") {
        return socio.estado_pago === "Pendiente";
      }

      if (socioFilter === "atrasados") {
        return socio.estado_pago === "Atrasado";
      }

      if (socioFilter === "inactivos") {
        return socio.estado_socio === "Inactivo";
      }

      return true;
    });
  }, [planById, socioFilter, socioSearch, socios]);
  const sociosActivos = useMemo(
    () => socios.filter((socio) => socio.estado_socio === "Activo"),
    [socios],
  );
  const sociosPendientes = useMemo(
    () => socios.filter((socio) => socio.estado_pago === "Pendiente"),
    [socios],
  );
  const sociosAtrasados = useMemo(
    () => socios.filter((socio) => socio.estado_pago === "Atrasado"),
    [socios],
  );
  const alertasAltaPrioridad = useMemo(
    () => alertas.filter((alerta) => alerta.prioridad === "Alta"),
    [alertas],
  );
  const pagosRecientes = pagos.slice(0, 5);

  return (
    <section className="data-panel">
      <div className="data-tabs" role="tablist" aria-label="Datos del gimnasio">
        <button
          className={activeTab === "resumen" ? "active" : ""}
          type="button"
          onClick={() => onTabChange("resumen")}
        >
          Resumen
        </button>
        <button
          className={activeTab === "socios" ? "active" : ""}
          type="button"
          onClick={() => onTabChange("socios")}
        >
          Socios
        </button>
        <button
          className={activeTab === "pagos" ? "active" : ""}
          type="button"
          onClick={() => onTabChange("pagos")}
        >
          Pagos
        </button>
        <button
          className={activeTab === "planes" ? "active" : ""}
          type="button"
          onClick={() => onTabChange("planes")}
        >
          Planes
        </button>
        <button
          className={activeTab === "alertas" ? "active" : ""}
          type="button"
          onClick={() => onTabChange("alertas")}
        >
          Alertas
        </button>
      </div>

      {activeTab === "resumen" && (
        <div className="summary-panel">
          <section className="summary-grid" aria-label="Resumen administrativo">
            <article className="summary-card">
              <span>Caja de hoy</span>
              <strong>{formatCurrency(ingresosHoy)}</strong>
              <p>{pagosHoy.length} pagos registrados</p>
            </article>
            <article className="summary-card">
              <span>Ingresos del mes</span>
              <strong>{formatCurrency(ingresosMes)}</strong>
              <p>{pagosMes.length} movimientos este mes</p>
            </article>
            <article className="summary-card">
              <span>Deuda estimada</span>
              <strong>{formatCurrency(deudaEstimada)}</strong>
              <p>{sociosPendientes.length + sociosAtrasados.length} socios por regularizar</p>
            </article>
            <article className="summary-card">
              <span>Alertas altas</span>
              <strong>{alertasAltaPrioridad.length}</strong>
              <p>{alertas.length} alertas pendientes</p>
            </article>
          </section>

          <section className="summary-actions" aria-label="Acciones rapidas">
            <button type="button" onClick={() => onTabChange("socios")}>
              Revisar socios atrasados
              <strong>{sociosAtrasados.length}</strong>
            </button>
            <button type="button" onClick={() => onTabChange("pagos")}>
              Ver pagos recientes
              <strong>{pagosRecientes.length}</strong>
            </button>
            <button type="button" onClick={() => onTabChange("alertas")}>
              Resolver alertas
              <strong>{alertas.length}</strong>
            </button>
          </section>

          <section className="summary-columns">
            <div>
              <h3>Pagos recientes</h3>
              <div className="compact-list">
                {pagosRecientes.map((pago) => {
                  const socio = socios.find((item) => item.id_socio === pago.id_socio);

                  return (
                    <div className="compact-list-item" key={pago.id_pago}>
                      <strong>{formatCurrency(pago.monto_pagado)}</strong>
                      <span>
                        {socio ? `${socio.apellido}, ${socio.nombre}` : `Socio ${pago.id_socio}`} |{" "}
                        {formatDate(pago.fecha_pago)}
                      </span>
                    </div>
                  );
                })}
                {pagosRecientes.length === 0 && <p>No hay pagos recientes.</p>}
              </div>
            </div>

            <div>
              <h3>Alertas importantes</h3>
              <div className="compact-list">
                {alertas.slice(0, 5).map((alerta) => {
                  const socio = socios.find((item) => item.id_socio === alerta.id_socio);

                  return (
                    <div className="compact-list-item" key={alerta.id_alerta}>
                      <strong>{alerta.titulo}</strong>
                      <span>
                        {socio ? `${socio.apellido}, ${socio.nombre}` : "General"} |{" "}
                        {alerta.prioridad}
                      </span>
                    </div>
                  );
                })}
                {alertas.length === 0 && <p>No hay alertas pendientes.</p>}
              </div>
            </div>

            <div>
              <h3>Estado de socios</h3>
              <div className="summary-status-list">
                <div>
                  <span>Activos</span>
                  <strong>{sociosActivos.length}</strong>
                </div>
                <div>
                  <span>Pendientes</span>
                  <strong>{sociosPendientes.length}</strong>
                </div>
                <div>
                  <span>Atrasados</span>
                  <strong>{sociosAtrasados.length}</strong>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {activeTab === "socios" && (
        <div className="table-wrap">
          <div className="table-controls">
            <label className="search-control">
              <FiSearch />
              <input
                value={socioSearch}
                onChange={(event) => setSocioSearch(event.target.value)}
                placeholder="Buscar socio, DNI o plan"
              />
            </label>

            <div className="segmented-filter" role="tablist" aria-label="Filtro de socios">
              {socioFilters.map((filter) => (
                <button
                  className={socioFilter === filter.value ? "active" : ""}
                  key={filter.value}
                  type="button"
                  onClick={() => setSocioFilter(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Socio</th>
                <th>DNI</th>
                <th>Plan</th>
                <th>Pago</th>
                <th>Estado</th>
                <th>Accion</th>
              </tr>
            </thead>
            <tbody>
              {visibleSocios.map((socio) => (
                <tr key={socio.id_socio}>
                  <td>
                    <strong>
                      {socio.apellido}, {socio.nombre}
                    </strong>
                    <small>Ingreso {formatDate(socio.fecha_ingreso)}</small>
                  </td>
                  <td>{socio.dni}</td>
                  <td>{planById[socio.id_plan]?.nombre_plan ?? `Plan ${socio.id_plan}`}</td>
                  <td>
                    <span className={`status-badge ${socio.estado_pago.toLowerCase()}`}>
                      {socio.estado_pago}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${socio.estado_socio.toLowerCase()}`}>
                      {socio.estado_socio}
                    </span>
                  </td>
                  <td>
                    <button
                      className="table-action-button"
                      type="button"
                      onClick={() => onSelectSocio(socio.id_socio)}
                    >
                      {selectedSocioId === socio.id_socio ? "Cerrar" : "Ver ficha"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {socios.length === 0 && <p className="empty-state">No hay socios cargados.</p>}
          {socios.length > 0 && visibleSocios.length === 0 && (
            <p className="empty-state">No hay socios que coincidan con la busqueda.</p>
          )}
          {selectedSocio && (
            <section className="socio-detail-panel" aria-label="Ficha del socio">
              <header className="socio-detail-header">
                <div>
                  <p>Ficha del socio</p>
                  <h2>
                    {selectedSocio.apellido}, {selectedSocio.nombre}
                  </h2>
                </div>
                <button
                  className="danger-button"
                  type="button"
                  disabled={selectedSocio.estado_socio === "Inactivo"}
                  onClick={() => onDesactivarSocio(selectedSocio.id_socio)}
                >
                  Desactivar
                </button>
              </header>

              <div className="socio-detail-grid">
                <article>
                  <span>DNI</span>
                  <strong>{selectedSocio.dni}</strong>
                </article>
                <article>
                  <span>Plan actual</span>
                  <strong>
                    {planById[selectedSocio.id_plan]?.nombre_plan ?? `Plan ${selectedSocio.id_plan}`}
                  </strong>
                </article>
                <article>
                  <span>Total pagado</span>
                  <strong>{formatCurrency(totalPagadoSocio)}</strong>
                </article>
                <article>
                  <span>Pagos registrados</span>
                  <strong>{pagosSocio.length}</strong>
                </article>
              </div>

              <div className="socio-detail-columns">
                <div>
                  <h3>Pagos recientes</h3>
                  <div className="compact-list">
                    {pagosSocio.slice(0, 5).map((pago) => (
                      <div className="compact-list-item" key={pago.id_pago}>
                        <strong>{formatCurrency(pago.monto_pagado)}</strong>
                        <span>
                          {formatDate(pago.fecha_pago)} | {pago.metodo_pago}
                        </span>
                      </div>
                    ))}
                    {pagosSocio.length === 0 && <p>No hay pagos registrados.</p>}
                  </div>
                </div>

                <div>
                  <h3>Eventos recientes</h3>
                  <div className="compact-list">
                    {socioEventos.slice(0, 6).map((evento) => (
                      <div className="compact-list-item" key={evento.id_evento}>
                        <strong>{evento.tipo_evento.replaceAll("_", " ")}</strong>
                        <span>
                          {evento.descripcion} | {formatDate(evento.created_at)}
                        </span>
                      </div>
                    ))}
                    {socioEventos.length === 0 && <p>No hay eventos registrados.</p>}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {activeTab === "pagos" && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Socio</th>
                <th>Metodo</th>
                <th>Monto</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((pago) => {
                const socio = socios.find((item) => item.id_socio === pago.id_socio);

                return (
                  <tr key={pago.id_pago}>
                    <td>{formatDate(pago.fecha_pago)}</td>
                    <td>{socio ? `${socio.apellido}, ${socio.nombre}` : `Socio ${pago.id_socio}`}</td>
                    <td>{pago.metodo_pago}</td>
                    <td>{formatCurrency(pago.monto_pagado)}</td>
                    <td>{pago.observaciones || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {pagos.length === 0 && <p className="empty-state">No hay pagos registrados.</p>}
        </div>
      )}

      {activeTab === "planes" && (
        <div className="plan-list">
          {planes.map((plan) => {
            const sociosDelPlan = socios.filter((socio) => socio.id_plan === plan.id_plan).length;

            return (
              <article className="plan-item" key={plan.id_plan}>
                <div>
                  <strong>{plan.nombre_plan}</strong>
                  <span>
                    {plan.dias_semana} dias por semana | {sociosDelPlan} socios asignados
                  </span>
                </div>
                <p>{formatCurrency(plan.precio)}</p>
              </article>
            );
          })}
          {planes.length === 0 && <p className="empty-state">No hay planes disponibles.</p>}
        </div>
      )}

      {activeTab === "alertas" && (
        <div className="alert-list">
          {alertas.map((alerta) => {
            const socio = socios.find((item) => item.id_socio === alerta.id_socio);

            return (
              <article className="alert-item" key={alerta.id_alerta}>
                <div>
                  <span className={`priority-badge ${alerta.prioridad.toLowerCase()}`}>
                    {alerta.prioridad}
                  </span>
                  <strong>{alerta.titulo}</strong>
                  <p>{alerta.descripcion}</p>
                  <small>
                    {socio ? `${socio.apellido}, ${socio.nombre}` : "Alerta general"} |{" "}
                    {formatDate(alerta.created_at)}
                  </small>
                </div>
                <button
                  className="outline-button resolve-button"
                  type="button"
                  onClick={() => onResolverAlerta(alerta.id_alerta)}
                >
                  Resolver
                </button>
              </article>
            );
          })}
          {alertas.length === 0 && <p className="empty-state">No hay alertas pendientes.</p>}
        </div>
      )}
    </section>
  );
}
