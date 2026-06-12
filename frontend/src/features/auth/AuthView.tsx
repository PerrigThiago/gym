import type { FormEvent } from "react";
import { FiLock, FiUser } from "react-icons/fi";
import { BrandRow } from "../../components/BrandRow";
import type { AuthMode } from "../../types/gym";

type AuthViewProps = {
  isLoading: boolean;
  message: string;
  mode: AuthMode;
  nombre: string;
  password: string;
  usuario: string;
  onModeChange: (mode: AuthMode) => void;
  onNombreChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUsuarioChange: (value: string) => void;
};

export function AuthView({
  isLoading,
  message,
  mode,
  nombre,
  password,
  usuario,
  onModeChange,
  onNombreChange,
  onPasswordChange,
  onSubmit,
  onUsuarioChange,
}: AuthViewProps) {
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
        <BrandRow className="auth-brand" />

        <div className="auth-header">
          <p>{mode === "login" ? "Acceso" : "Alta de usuario"}</p>
          <h1>{mode === "login" ? "Iniciar sesion" : "Crear cuenta"}</h1>
        </div>

        <div className="mode-switch" role="tablist" aria-label="Modo de autenticacion">
          <button
            className={mode === "login" ? "active" : ""}
            type="button"
            onClick={() => onModeChange("login")}
          >
            Login
          </button>
          <button
            className={mode === "register" ? "active" : ""}
            type="button"
            onClick={() => onModeChange("register")}
          >
            Registro
          </button>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          <label>
            Usuario
            <span>
              <FiUser />
              <input
                autoComplete="username"
                value={usuario}
                onChange={(event) => onUsuarioChange(event.target.value)}
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
                  onChange={(event) => onNombreChange(event.target.value)}
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
                onChange={(event) => onPasswordChange(event.target.value)}
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
