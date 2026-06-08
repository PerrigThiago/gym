import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { FiActivity, FiCheckCircle, FiLock, FiLogOut, FiUser } from "react-icons/fi";
import "./App.css";

type AuthMode = "login" | "register";

type Usuario = {
  id_usuario: number;
  usuario: string;
  nombre?: string;
};

const API_URL = "http://localhost:3000/api/auth";

function App() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [usuario, setUsuario] = useState("");
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(() => localStorage.getItem("token") ?? "");
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setCurrentUser(null);
      return;
    }

    const validateToken = async () => {
      try {
        const response = await fetch(`${API_URL}/me`, {
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

  const resetForm = () => {
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
      const response = await fetch(`${API_URL}/${endpoint}`, {
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
        resetForm();
        setMessage("Usuario registrado. Inicia sesion.");
        return;
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setCurrentUser(data.usuario);
      resetForm();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setCurrentUser(null);
    setMessage("");
  };

  if (currentUser) {
    return (
      <main className="app-shell">
        <section className="session-panel">
          <div className="brand-row">
            <span className="brand-mark">
              <FiActivity />
            </span>
            <span>Gym Admin</span>
          </div>

          <div className="session-content">
            <FiCheckCircle className="session-icon" />
            <h1>Sesion activa</h1>
            <p>{currentUser.nombre ?? currentUser.usuario}</p>
            <span className="user-tag">@{currentUser.usuario}</span>
          </div>

          <button className="secondary-button" type="button" onClick={handleLogout}>
            <FiLogOut />
            Cerrar sesion
          </button>
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
