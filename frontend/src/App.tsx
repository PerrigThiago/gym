import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  FiActivity,
  FiCalendar,
  FiCreditCard,
  FiDollarSign,
  FiLock,
  FiLogOut,
  FiRefreshCw,
  FiRepeat,
  FiTrendingUp,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import "./App.css";

type AuthMode = "login" | "register";
type MetodoPago = "Efectivo" | "MercadoPago";
type DashboardTab = "socios" | "pagos" | "planes";

type Usuario = {
  id_usuario: number;
  usuario: string;
  nombre?: string;
};

type Plan = {
  id_plan: number;
  nombre_plan: string;
  dias_semana: number;
  precio: number | string;
};

type Socio = {
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

type Pago = {
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

type DashboardMessage = {
  type: "success" | "error";
  text: string;
} | null;

const API_BASE_URL = "http://localhost:3000/api";
const AUTH_API_URL = `${API_BASE_URL}/auth`;

const emptySocioForm = {
  nombre: "",
  apellido: "",
  dni: "",
  fecha_ingreso: "",
  id_plan: "",
};

const emptyPagoForm = {
  id_socio: "",
  monto_pagado: "",
  metodo_pago: "Efectivo" as MetodoPago,
  comprobante: "",
  observaciones: "",
};

const emptyCambioPlanForm = {
  id_socio: "",
  id_plan: "",
};

const formatCurrency = (value: number | string) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(value));

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

const fetchApi = async <T,>(
  endpoint: string,
  token: string,
  options: RequestInit = {},
) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? "No se pudo completar la operacion");
  }

  return data as T;
};

function App() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [usuario, setUsuario] = useState("");
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(() => localStorage.getItem("token") ?? "");
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [planes, setPlanes] = useState<Plan[]>([]);
  const [socios, setSocios] = useState<Socio[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [activeTab, setActiveTab] = useState<DashboardTab>("socios");
  const [dashboardMessage, setDashboardMessage] = useState<DashboardMessage>(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [socioForm, setSocioForm] = useState(emptySocioForm);
  const [pagoForm, setPagoForm] = useState(emptyPagoForm);
  const [cambioPlanForm, setCambioPlanForm] = useState(emptyCambioPlanForm);

  const loadDashboard = async () => {
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
  };

  useEffect(() => {
    if (!token) {
      setCurrentUser(null);
      return;
    }

    const validateToken = async () => {
      try {
        const response = await fetch(`${AUTH_API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Sesion vencida");
        }

        const data = await response.json();
        setCurrentUser(data.usuario);
      } catch {
        localStorage.removeItem("token");
        setToken("");
        setCurrentUser(null);
      }
    };

    validateToken();
  }, [token]);

  useEffect(() => {
    if (currentUser) {
      loadDashboard();
    }
  }, [currentUser]);

  const planById = useMemo(() => {
    return planes.reduce<Record<number, Plan>>((accumulator, plan) => {
      accumulator[plan.id_plan] = plan;
      return accumulator;
    }, {});
  }, [planes]);

  const sociosActivos = socios.filter((socio) => socio.estado_socio === "Activo");
  const sociosPendientes = socios.filter((socio) => socio.estado_pago === "Pendiente");
  const sociosAtrasados = socios.filter((socio) => socio.estado_pago === "Atrasado");
  const ingresosRegistrados = pagos.reduce(
    (total, pago) => total + Number(pago.monto_pagado),
    0,
  );
  const pagosRecientes = pagos.slice(0, 5);

  const resetAuthForm = () => {
    setUsuario("");
    setNombre("");
    setPassword("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    const endpoint = mode === "login" ? "login" : "register";
    const payload =
      mode === "login"
        ? { usuario, password }
        : { usuario, nombre, password };

    try {
      const response = await fetch(`${AUTH_API_URL}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "No se pudo completar la operacion");
      }

      if (mode === "register") {
        setMode("login");
        resetAuthForm();
        setMessage("Usuario registrado. Inicia sesion.");
        return;
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setCurrentUser(data.usuario);
      resetAuthForm();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setCurrentUser(null);
    setMessage("");
    setDashboardMessage(null);
  };

  if (currentUser) {
    return (
      <main className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <div className="brand-row sidebar-brand">
            <span className="brand-mark">
              <FiActivity />
            </span>
            <span>Gym Admin</span>
          </div>

          <div className="sidebar-user">
            <span>Sesion</span>
            <strong>{currentUser.nombre ?? currentUser.usuario}</strong>
            <small>@{currentUser.usuario}</small>
          </div>

          <nav className="sidebar-nav" aria-label="Secciones del dashboard">
            <button
              className={activeTab === "socios" ? "active" : ""}
              type="button"
              onClick={() => setActiveTab("socios")}
            >
              <FiUsers />
              Socios
            </button>
            <button
              className={activeTab === "pagos" ? "active" : ""}
              type="button"
              onClick={() => setActiveTab("pagos")}
            >
              <FiCreditCard />
              Pagos
            </button>
            <button
              className={activeTab === "planes" ? "active" : ""}
              type="button"
              onClick={() => setActiveTab("planes")}
            >
              <FiCalendar />
              Planes
            </button>
          </nav>

          <button className="logout-button" type="button" onClick={handleLogout}>
            <FiLogOut />
            Cerrar sesion
          </button>
        </aside>

        <section className="dashboard-main">
          <header className="dashboard-header">
            <div>
              <p>Panel operativo</p>
              <h1>Dashboard</h1>
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

          <section className="metrics-grid" aria-label="Indicadores principales">
            <article className="metric-card">
              <span>
                <FiUsers />
              </span>
              <p>Socios activos</p>
              <strong>{sociosActivos.length}</strong>
            </article>
            <article className="metric-card">
              <span>
                <FiTrendingUp />
              </span>
              <p>Pendientes</p>
              <strong>{sociosPendientes.length}</strong>
            </article>
            <article className="metric-card">
              <span>
                <FiCalendar />
              </span>
              <p>Atrasados</p>
              <strong>{sociosAtrasados.length}</strong>
            </article>
            <article className="metric-card">
              <span>
                <FiDollarSign />
              </span>
              <p>Pagos registrados</p>
              <strong>{formatCurrency(ingresosRegistrados)}</strong>
            </article>
          </section>

          <section className="tools-grid">
            <form className="tool-panel" onSubmit={handleCreateSocio}>
              <div className="tool-header">
                <FiUser />
                <h2>Nuevo socio</h2>
              </div>
              <div className="form-grid two-columns">
                <label>
                  Nombre
                  <input
                    value={socioForm.nombre}
                    onChange={(event) =>
                      setSocioForm({ ...socioForm, nombre: event.target.value })
                    }
                    required
                  />
                </label>
                <label>
                  Apellido
                  <input
                    value={socioForm.apellido}
                    onChange={(event) =>
                      setSocioForm({ ...socioForm, apellido: event.target.value })
                    }
                    required
                  />
                </label>
                <label>
                  DNI
                  <input
                    value={socioForm.dni}
                    onChange={(event) =>
                      setSocioForm({ ...socioForm, dni: event.target.value })
                    }
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
                    onChange={(event) =>
                      setSocioForm({ ...socioForm, id_plan: event.target.value })
                    }
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

            <form className="tool-panel" onSubmit={handleRegistrarPago}>
              <div className="tool-header">
                <FiCreditCard />
                <h2>Registrar pago</h2>
              </div>
              <div className="form-grid">
                <label>
                  Socio
                  <select
                    value={pagoForm.id_socio}
                    onChange={(event) =>
                      setPagoForm({ ...pagoForm, id_socio: event.target.value })
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
              <button className="primary-button compact" type="submit">
                Registrar pago
              </button>
            </form>

            <div className="tool-panel">
              <div className="tool-header">
                <FiRepeat />
                <h2>Operaciones</h2>
              </div>
              <form className="form-grid" onSubmit={handleCambiarPlan}>
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
                <button className="secondary-button compact" type="submit">
                  Cambiar plan
                </button>
              </form>

              <div className="rule-actions">
                <button
                  className="outline-button"
                  type="button"
                  onClick={() => handleReglaMensual("pendientes")}
                >
                  Marcar pendientes
                </button>
                <button
                  className="outline-button"
                  type="button"
                  onClick={() => handleReglaMensual("atrasados")}
                >
                  Marcar atrasados
                </button>
              </div>
            </div>
          </section>

          <section className="data-panel">
            <div className="data-tabs" role="tablist" aria-label="Datos del gimnasio">
              <button
                className={activeTab === "socios" ? "active" : ""}
                type="button"
                onClick={() => setActiveTab("socios")}
              >
                Socios
              </button>
              <button
                className={activeTab === "pagos" ? "active" : ""}
                type="button"
                onClick={() => setActiveTab("pagos")}
              >
                Pagos
              </button>
              <button
                className={activeTab === "planes" ? "active" : ""}
                type="button"
                onClick={() => setActiveTab("planes")}
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
                    </tr>
                  </thead>
                  <tbody>
                    {pagosRecientes.map((pago) => {
                      const socio = socios.find((item) => item.id_socio === pago.id_socio);

                      return (
                        <tr key={pago.id_pago}>
                          <td>{formatDate(pago.fecha_pago)}</td>
                          <td>
                            {socio ? `${socio.apellido}, ${socio.nombre}` : `Socio ${pago.id_socio}`}
                          </td>
                          <td>{pago.metodo_pago}</td>
                          <td>{formatCurrency(pago.monto_pagado)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "planes" && (
              <div className="plan-list">
                {planes.map((plan) => (
                  <article className="plan-item" key={plan.id_plan}>
                    <div>
                      <strong>{plan.nombre_plan}</strong>
                      <span>{plan.dias_semana} dias por semana</span>
                    </div>
                    <p>{formatCurrency(plan.precio)}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-layout">
      <section className="visual-panel" aria-label="Gym Admin">
        <img
          className="visual-image"
          src="/login-gym.jpg"
          alt=""
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
        />
        <div className="gym-info-card">
          <span>Centro de entrenamiento</span>
          <h2>Gestion integral para tu gimnasio</h2>
          <p>Control de accesos, socios, rutinas y seguimiento operativo desde un solo panel.</p>
        </div>
      </section>

      <section className="auth-panel">
        <div className="brand-row auth-brand">
          <span className="brand-mark">
            <FiActivity />
          </span>
          <span>Gym Admin</span>
        </div>

        <div className="auth-header">
          <p>{mode === "login" ? "Acceso" : "Alta de usuario"}</p>
          <h1>{mode === "login" ? "Iniciar sesion" : "Crear cuenta"}</h1>
        </div>

        <div className="mode-switch" role="tablist" aria-label="Modo de autenticacion">
          <button
            className={mode === "login" ? "active" : ""}
            type="button"
            onClick={() => {
              setMode("login");
              setMessage("");
            }}
          >
            Login
          </button>
          <button
            className={mode === "register" ? "active" : ""}
            type="button"
            onClick={() => {
              setMode("register");
              setMessage("");
            }}
          >
            Registro
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Usuario
            <span>
              <FiUser />
              <input
                autoComplete="username"
                value={usuario}
                onChange={(event) => setUsuario(event.target.value)}
                placeholder="admin"
                required
              />
            </span>
          </label>

          {mode === "register" && (
            <label>
              Nombre
              <span>
                <FiUser />
                <input
                  autoComplete="name"
                  value={nombre}
                  onChange={(event) => setNombre(event.target.value)}
                  placeholder="Administrador"
                  required
                />
              </span>
            </label>
          )}

          <label>
            Password
            <span>
              <FiLock />
              <input
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={mode === "register" ? 6 : 1}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="123456"
                required
              />
            </span>
          </label>

          {message && <p className="form-message">{message}</p>}

          <button className="primary-button" type="submit" disabled={isLoading}>
            {isLoading ? "Procesando..." : mode === "login" ? "Entrar" : "Registrar"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default App;
