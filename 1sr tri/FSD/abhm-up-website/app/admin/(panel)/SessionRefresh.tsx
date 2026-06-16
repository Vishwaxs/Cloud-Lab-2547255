"use client";

import { useEffect } from "react";
import { adminFetch } from "@/lib/security/adminFetch";

async function refreshSession() {
  try {
    await adminFetch("/api/admin/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // Ignore refresh failures; protected pages will redirect on expiry.
  }
}

export default function SessionRefresh() {
  useEffect(() => {
    // Refresh immediately on mount to extend session.
    void refreshSession();

    // Keep session fresh for short-lived access tokens.
    const id = window.setInterval(() => {
      void refreshSession();
    }, 10 * 60 * 1000);

    const onFocus = () => {
      void refreshSession();
    };

    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return null;
}
