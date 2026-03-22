export function getApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim();

  if (!configuredBaseUrl) {
    return "http://127.0.0.1:8000";
  }

  return configuredBaseUrl.replace(/\/+$/, "");
}


export function getApiUrl(path) {
  return `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
