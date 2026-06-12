import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  FiCalendar,
  FiCreditCard,
  FiDollarSign,
  FiRefreshCw,
  FiTrendingUp,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";
import {
  emptyCambioPlanForm,
  emptyPagoForm,
  emptySocioForm,
} from "../../constants/forms";
import { fetchApi } from "../../services/api";
import type {
  DashboardMessage,
  DashboardTab,
  MetodoPago,
  Pago,
  Plan,
  Socio,
  Usuario,
} from "../../types/gym";
import { formatCurrency } from "../../utils/formatters";
import { DashboardDataPanel } from "./components/DashboardDataPanel";
import { DashboardMetrics } from "./components/DashboardMetrics";
import type { DashboardMetric } from "./components/DashboardMetrics";
import { DashboardSidebar } from "./components/DashboardSidebar";
import { DashboardTools } from "./components/DashboardTools";

type DashboardViewProps = {
  currentUser: Usuario;
  token: string;
  onLogout: () => void;
};

const tabContent: Record<DashboardTab, { eyebrow: string; title: string }> = {
  socios: {
    eyebrow: "Gestion de socios",
    title: "Socios",
  },
  pagos: {
    eyebrow: "Movimientos y caja",
    title: "Pagos",
  },
  planes: {
    eyebrow: "Configuracion comercial",
    title: "Planes",
  },
};

export function DashboardView({ currentUser, token, onLogout }: DashboardViewProps) {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [socios, setSocios] = useState<Socio[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [activeTab, setActiveTab] = useState<DashboardTab>("socios");
  const [dashboardMessage, setDashboardMessage] = useState<DashboardMessage>(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [socioForm, setSocioForm] = useState(emptySocioForm);
  const [pagoForm, setPagoForm] = useState(emptyPagoForm);
  const [cambioPlanForm, setCambioPlanForm] = useState(emptyCambioPlanForm);

  const loadDashboard = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsDashboardLoading(true);

    try {
      const [planesData, sociosData, pagosData] = await Promise.all([
        fetchApi<{ planes: Plan[] }>("/planes", token),
        fetchApi<{ socios: Socio[] }>("/socios", token),
        fetchApi<{ pagos: Pago[] }>("/pagos", token),
      ]);

      setPlanes(planesData.planes);
      setSocios(sociosData.socios);
      setPagos(pagosData.pagos);
    } catch (error) {
      setDashboardMessage({
        type: "error",
        text: error instanceof Error ? error.message : "No se pudo cargar el dashboard",
      });
    } finally {
      setIsDashboardLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const planById = useMemo(() => {
    return planes.reduce<Record<number, Plan>>((accumulator, plan) => {
      accumulator[plan.id_plan] = plan;
      return accumulator;
    }, {});
  }, [planes]);

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
  const ingresosRegistrados = useMemo(
    () => pagos.reduce((total, pago) => total + Number(pago.monto_pagado), 0),
    [pagos],
  );
  const ingresosPorMetodo = useMemo(
    () =>
      pagos.reduce<Record<MetodoPago, number>>(
        (total, pago) => {
          total[pago.metodo_pago] += Number(pago.monto_pagado);
          return total;
        },
        { Efectivo: 0, MercadoPago: 0 },
      ),
    [pagos],
  );
  const precioPromedioPlanes = useMemo(() => {
    if (planes.length === 0) {
      return 0;
    }

    return planes.reduce((total, plan) => total + Number(plan.precio), 0) / planes.length;
  }, [planes]);
  const mayorPrecioPlan = useMemo(
    () => planes.reduce((maximo, plan) => Math.max(maximo, Number(plan.precio)), 0),
    [planes],
  );
  const sociosConPlan = useMemo(
    () => socios.filter((socio) => Boolean(planById[socio.id_plan])).length,
    [planById, socios],
  );

  const metrics = useMemo<DashboardMetric[]>(() => {
    if (activeTab === "pagos") {
      return [
        { icon: FiCreditCard, label: "Pagos cargados", value: pagos.length },
        { icon: FiDollarSign, label: "Ingresos", value: formatCurrency(ingresosRegistrados) },
        { icon: FiTrendingUp, label: "Efectivo", value: formatCurrency(ingresosPorMetodo.Efectivo) },
        {
          icon: FiTrendingUp,
          label: "MercadoPago",
          value: formatCurrency(ingresosPorMetodo.MercadoPago),
        },
      ];
    }

    if (activeTab === "planes") {
      return [
        { icon: FiCalendar, label: "Planes activos", value: planes.length },
        { icon: FiDollarSign, label: "Precio promedio", value: formatCurrency(precioPromedioPlanes) },
        { icon: FiTrendingUp, label: "Mayor precio", value: formatCurrency(mayorPrecioPlan) },
        { icon: FiUserCheck, label: "Socios asignados", value: sociosConPlan },
      ];
    }

    return [
      { icon: FiUsers, label: "Total socios", value: socios.length },
      { icon: FiUserCheck, label: "Socios activos", value: sociosActivos.length },
      { icon: FiTrendingUp, label: "Pendientes", value: sociosPendientes.length },
      { icon: FiCalendar, label: "Atrasados", value: sociosAtrasados.length },
    ];
  }, [
    activeTab,
    ingresosPorMetodo,
    ingresosRegistrados,
    mayorPrecioPlan,
    pagos.length,
    planes.length,
    precioPromedioPlanes,
    socios.length,
    sociosActivos.length,
    sociosAtrasados.length,
    sociosConPlan,
    sociosPendientes.length,
  ]);

  const handleCreateSocio = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDashboardMessage(null);

    const payload = {
      nombre: socioForm.nombre,
      apellido: socioForm.apellido,
      dni: socioForm.dni,
      id_plan: socioForm.id_plan,
      ...(socioForm.fecha_ingreso ? { fecha_ingreso: socioForm.fecha_ingreso } : {}),
    };

    try {
      await fetchApi("/socios", token, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSocioForm(emptySocioForm);
      setDashboardMessage({ type: "success", text: "Socio creado correctamente" });
      await loadDashboard();
    } catch (error) {
      setDashboardMessage({
        type: "error",
        text: error instanceof Error ? error.message : "No se pudo crear el socio",
      });
    }
  };

  const handleRegistrarPago = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDashboardMessage(null);

    const payload = {
      id_socio: pagoForm.id_socio,
      monto_pagado: pagoForm.monto_pagado,
      metodo_pago: pagoForm.metodo_pago,
      ...(pagoForm.comprobante ? { comprobante: pagoForm.comprobante } : {}),
      ...(pagoForm.observaciones ? { observaciones: pagoForm.observaciones } : {}),
    };

    try {
      await fetchApi("/pagos", token, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setPagoForm(emptyPagoForm);
      setDashboardMessage({ type: "success", text: "Pago registrado correctamente" });
      await loadDashboard();
    } catch (error) {
      setDashboardMessage({
        type: "error",
        text: error instanceof Error ? error.message : "No se pudo registrar el pago",
      });
    }
  };

  const handleCambiarPlan = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDashboardMessage(null);

    try {
      await fetchApi(`/socios/${cambioPlanForm.id_socio}/plan`, token, {
        method: "PATCH",
        body: JSON.stringify({ id_plan: cambioPlanForm.id_plan }),
      });

      setCambioPlanForm(emptyCambioPlanForm);
      setDashboardMessage({ type: "success", text: "Plan actualizado correctamente" });
      await loadDashboard();
    } catch (error) {
      setDashboardMessage({
        type: "error",
        text: error instanceof Error ? error.message : "No se pudo cambiar el plan",
      });
    }
  };

  const handleReglaMensual = async (regla: "pendientes" | "atrasados") => {
    setDashboardMessage(null);

    try {
      const data = await fetchApi<{ socios_actualizados: number }>(
        `/reglas-mensuales/${regla}`,
        token,
        { method: "POST" },
      );

      setDashboardMessage({
        type: "success",
        text: `Regla aplicada. Socios actualizados: ${data.socios_actualizados}`,
      });
      await loadDashboard();
    } catch (error) {
      setDashboardMessage({
        type: "error",
        text: error instanceof Error ? error.message : "No se pudo aplicar la regla",
      });
    }
  };

  return (
    <main className="dashboard-layout">
      <DashboardSidebar
        activeTab={activeTab}
        currentUser={currentUser}
        onLogout={onLogout}
        onTabChange={setActiveTab}
      />

      <section className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p>{tabContent[activeTab].eyebrow}</p>
            <h1>{tabContent[activeTab].title}</h1>
          </div>
          <button className="icon-text-button" type="button" onClick={loadDashboard}>
            <FiRefreshCw />
            {isDashboardLoading ? "Actualizando" : "Actualizar"}
          </button>
        </header>

        {dashboardMessage && (
          <p className={`dashboard-message ${dashboardMessage.type}`}>
            {dashboardMessage.text}
          </p>
        )}

        <DashboardMetrics metrics={metrics} />

        <DashboardTools
          activeTab={activeTab}
          cambioPlanForm={cambioPlanForm}
          pagoForm={pagoForm}
          planes={planes}
          socioForm={socioForm}
          sociosActivos={sociosActivos}
          onCambiarPlan={handleCambiarPlan}
          onCreateSocio={handleCreateSocio}
          onRegistrarPago={handleRegistrarPago}
          onReglaMensual={handleReglaMensual}
          setCambioPlanForm={setCambioPlanForm}
          setPagoForm={setPagoForm}
          setSocioForm={setSocioForm}
        />

        <DashboardDataPanel
          activeTab={activeTab}
          pagos={pagos}
          planById={planById}
          planes={planes}
          socios={socios}
          onTabChange={setActiveTab}
        />
      </section>
    </main>
  );
}
