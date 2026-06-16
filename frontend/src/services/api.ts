export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";
export const AUTH_API_URL = `${API_BASE_URL}/auth`;

export const fetchApi = async <T,>(
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
