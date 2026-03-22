import { getApiUrl } from "./base";

const SESSION_KEY = "zenix-session";

function normalizeApiErrorMessage(detail, fallbackMessage) {
  if (!detail) return fallbackMessage;
  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    const first = detail[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object") {
      if (typeof first.msg === "string") return first.msg;
      if (typeof first.message === "string") return first.message;
    }
  }

  if (typeof detail === "object") {
    if (typeof detail.msg === "string") return detail.msg;
    if (typeof detail.message === "string") return detail.message;
  }

  return fallbackMessage;
}

async function parseApiResponse(res) {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(
      normalizeApiErrorMessage(
        data.detail,
        `Request failed with status ${res.status}`,
      ),
    );
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

async function postAuth(path, payload) {
  const res = await fetch(getApiUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseApiResponse(res);
}

export function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function persistSession(session) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      user: session.user,
    }),
  );
}

export function clearStoredSession() {
  localStorage.removeItem(SESSION_KEY);
}

export async function login(email, password) {
  return postAuth("/api/login", { email, password });
}

export async function register(email, password) {
  return postAuth("/api/register", { email, password });
}

export async function getCurrentUser(token) {
  const res = await fetch(getApiUrl("/api/me"), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseApiResponse(res);
}
