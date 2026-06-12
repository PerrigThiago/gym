import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import "./App.css";
import { AuthView } from "./features/auth/AuthView";
import { DashboardView } from "./features/dashboard/DashboardView";
import { AUTH_API_URL } from "./services/api";
import type { AuthMode, Usuario } from "./types/gym";

function App() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [usuario, setUsuario] = useState("");
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(() => localStorage.getItem("token") ?? "");
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const resetAuthForm = () => {
    setUsuario("");
    setNombre("");
    setPassword("");
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

  const handleModeChange = (nextMode: AuthMode) => {
    setMode(nextMode);
    setMessage("");
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
        setUsuario("");
        setNombre("");
        setPassword("");
        setMessage(data.message ?? "Usuario registrado. Ya podes iniciar sesion.");
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setCurrentUser(null);
    setMessage("");
  };

  if (currentUser) {
    return <DashboardView currentUser={currentUser} token={token} onLogout={handleLogout} />;
  }

  return (
    <AuthView
      isLoading={isLoading}
      message={message}
      mode={mode}
      nombre={nombre}
      password={password}
      usuario={usuario}
      onModeChange={handleModeChange}
      onNombreChange={setNombre}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
      onUsuarioChange={setUsuario}
    />
  );
}

export default App;
