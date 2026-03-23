import { getApiUrl } from "./base";

const SESSION_KEY = "zenix-session";

function normalizeUser(user) {
  if (!user?.email) return null;

  return {
    email: user.email,
    name: user.name || user.email.split("@", 1)[0],
  };
}

function normalizeSession(session) {
  if (!session) return null;

  return {
    accessToken: session.accessToken || session.access_token || null,
    refreshToken: session.refreshToken || session.refresh_token || null,
    tokenType: session.tokenType || session.token_type || "bearer",
    user: normalizeUser(session.user),
  };
}

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
  let res;

  try {
    res = await fetch(getApiUrl(path), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      "Unable to reach the authentication server. Please make sure the backend is running on port 8000.",
    );
  }

  return parseApiResponse(res);
}

export function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? normalizeSession(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function persistSession(session) {
  const normalized = normalizeSession(session);
  if (!normalized?.accessToken) return;

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      accessToken: normalized.accessToken,
      refreshToken: normalized.refreshToken,
      tokenType: normalized.tokenType,
      user: normalized.user,
    }),
  );
}

export function clearStoredSession() {
  localStorage.removeItem(SESSION_KEY);
}

export async function login(email, password) {
  return normalizeSession(await postAuth("/api/login", { email, password }));
}

export async function register(name, email, password) {
  return normalizeSession(
    await postAuth("/api/register", {
      name,
      email,
      password,
    }),
  );
}

export async function getCurrentUser(token) {
  let res;

  try {
    res = await fetch(getApiUrl("/api/me"), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new Error(
      "Unable to verify the current session because the backend is unavailable.",
    );
  }

  return parseApiResponse(res);
}
