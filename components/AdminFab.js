"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const ALLOWED_ADMIN_EMAILS = [
  "andreaguirre007@gmail.com",
  "gabriel64hd@gmail.com",
];

export default function AdminFab() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const allowed = useMemo(() => {
    const email = session?.user?.email;
    return !!email && ALLOWED_ADMIN_EMAILS.includes(email);
  }, [session]);

  if (!session) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn btn-accent btn-circle shadow-xl fixed bottom-6 right-6 z-50"
        aria-label="Admin panel"
      >
        <span className="text-xl">⚙</span>
      </button>

      {open && (
        <div className="fixed bottom-20 right-4 z-50 w-80 max-w-[90vw]">
          <div className="card bg-base-200 shadow-2xl border border-base-300">
            <div className="card-body gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="card-title text-lg">Admin Access</h3>
                  <p className="text-sm text-base-content/60">Panel rápido para admins</p>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => setOpen(false)}
                >
                  ✕
                </button>
              </div>

              {allowed ? (
                <>
                  <p className="text-sm text-base-content/70">
                    Hola {session?.user?.name || ""}. Accede al panel para seedear y editar gigs.
                  </p>
                  <Link href="/dashboard/admin" className="btn btn-primary w-full">
                    Abrir panel admin
                  </Link>
                </>
              ) : (
                <p className="text-sm text-error">
                  Tu correo no tiene acceso admin. Contacta al owner para habilitarlo.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
