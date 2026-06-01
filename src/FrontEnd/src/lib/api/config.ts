const DEFAULT_API_URL = "http://localhost:5102";

export function getApiBaseUrl(): string {
  const url = import.meta.env.VITE_API_URL;
  return (typeof url === "string" && url.length > 0 ? url : DEFAULT_API_URL).replace(/\/$/, "");
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message || `Erro HTTP ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
