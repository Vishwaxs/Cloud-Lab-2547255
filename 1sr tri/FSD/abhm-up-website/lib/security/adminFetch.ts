"use client";

import { CSRF_COOKIE, CSRF_HEADER } from "@/lib/security/csrf";

type AdminFetchInit = RequestInit & {
  csrf?: boolean;
};

function getCookieValue(name: string) {
  if (typeof document === "undefined") return null;
  const parts = document.cookie.split(";");
  for (const part of parts) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export async function adminFetch(input: RequestInfo | URL, init: AdminFetchInit = {}) {
  const method = (init.method || "GET").toUpperCase();
  const isMutating = method !== "GET" && method !== "HEAD" && method !== "OPTIONS";
  const shouldCsrf = init.csrf ?? isMutating;

  const headers = new Headers(init.headers || undefined);

  if (shouldCsrf) {
    const token = getCookieValue(CSRF_COOKIE);
    if (token) headers.set(CSRF_HEADER, token);
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: "include",
  });
}
