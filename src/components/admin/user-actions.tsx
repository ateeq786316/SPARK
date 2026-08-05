"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setUserRole, setUserSuspended } from "@/lib/db/admin-actions";

export function UserActions({
  userId,
  role,
  isSuspended,
}: {
  userId: string;
  role: "user" | "admin";
  isSuspended: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleRole() {
    setPending(true);
    setError(null);
    const res = await setUserRole(userId, role === "admin" ? "user" : "admin");
    if (!res.ok) setError(res.message ?? "Failed.");
    router.refresh();
    setPending(false);
  }

  async function toggleSuspend() {
    if (isSuspended) {
      if (!window.confirm("Reactivate this user?")) return;
    } else if (!window.confirm("Suspend this user? They will be signed out and blocked.")) return;
    setPending(true);
    setError(null);
    const res = await setUserSuspended(userId, !isSuspended);
    if (!res.ok) setError(res.message ?? "Failed.");
    router.refresh();
    setPending(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={toggleRole}
        disabled={pending}
        className="rounded-md border border-input px-2 py-1.5 text-xs hover:bg-accent disabled:opacity-50"
      >
        {role === "admin" ? "Revoke admin" : "Make admin"}
      </button>
      <button
        type="button"
        onClick={toggleSuspend}
        disabled={pending}
        className="rounded-md border border-destructive/40 px-2 py-1.5 text-xs text-destructive hover:bg-destructive/5 disabled:opacity-50"
      >
        {isSuspended ? "Reactivate" : "Suspend"}
      </button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  );
}
