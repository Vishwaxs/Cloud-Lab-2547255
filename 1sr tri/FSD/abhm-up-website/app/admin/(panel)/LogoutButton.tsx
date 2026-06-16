"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { adminFetch } from "@/lib/security/adminFetch";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await adminFetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  return (
    <Button variant="outline" onClick={logout}>
      Logout
    </Button>
  );
}
