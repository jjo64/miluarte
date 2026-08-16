import { useState, useCallback } from "react";
import { useNavigate } from "react-router";

export function useAdminApi() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const getToken = useCallback(() => {
    return localStorage.getItem("miluarte_admin_token");
  }, []);

  const setToken = useCallback((token: string) => {
    localStorage.setItem("miluarte_admin_token", token);
  }, []);

  const removeToken = useCallback(() => {
    localStorage.removeItem("miluarte_admin_token");
  }, []);

  const request = useCallback(
    async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
      setLoading(true);
      setError(null);

      const token = getToken();
      const headers = new Headers(options.headers || {});

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
      }

      try {
        const response = await fetch(endpoint, {
          ...options,
          headers,
        });

        const data = await response.json().catch(() => null);

        if (response.status === 401) {
          removeToken();
          navigate("/admin/login");
          throw new Error(data?.error || "Sesión expirada o no autorizada");
        }

        if (!response.ok) {
          throw new Error(data?.error || `Error en la solicitud (${response.status})`);
        }

        return data as T;
      } catch (err: any) {
        const msg = err.message || "Error de red o del servidor";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getToken, removeToken, navigate]
  );

  return {
    loading,
    error,
    request,
    getToken,
    setToken,
    removeToken,
    isAuthenticated: Boolean(getToken()),
  };
}
