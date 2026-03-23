import { getApiUrl } from "./base";

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

export async function sendMessage(message, { history = [], token } = {}) {
  const authToken = token || null;
  let res;

  try {
    res = await fetch(getApiUrl("/api/chat"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({
        message,
        history,
      }),
    });
  } catch {
    throw new Error(
      "Unable to reach the backend server. Please make sure the API is running on port 8000.",
    );
  }

  return parseApiResponse(res);
}

export async function getConversationHistory({ token }) {
  let res;

  try {
    res = await fetch(getApiUrl("/api/history"), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new Error(
      "Unable to load conversation history because the backend is unavailable.",
    );
  }

  return parseApiResponse(res);
}
