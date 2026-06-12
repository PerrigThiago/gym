import type { DashboardTab, Pago, Plan, Socio } from "../../../types/gym";
import { formatCurrency, formatDate } from "../../../utils/formatters";

type DashboardDataPanelProps = {
  activeTab: DashboardTab;
  pagos: Pago[];
  planById: Record<number, Plan>;
  planes: Plan[];
  socios: Socio[];
  onTabChange: (tab: DashboardTab) => void;
};

export function DashboardDataPanel({
  activeTab,
  pagos,
  planById,
  planes,
  socios,
  onTabChange,
}: DashboardDataPanelProps) {
  return (
    <section className="data-panel">
      <div className="data-tabs" role="tablist" aria-label="Datos del gimnasio">
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
      </div>

      {activeTab === "socios" && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Socio</th>
                <th>DNI</th>
                <th>Plan</th>
                <th>Pago</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {socios.map((socio) => (
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
                </tr>
              ))}
            </tbody>
          </table>
          {socios.length === 0 && <p className="empty-state">No hay socios cargados.</p>}
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
    </section>
  );
}
