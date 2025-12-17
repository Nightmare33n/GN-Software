"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useSession } from "next-auth/react";
import config from "@/config";

const ALLOWED_ADMIN_EMAILS = [
  "andreaguirre007@gmail.com",
  "gabriel64hd@gmail.com",
];

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [role, setRole] = useState("loading");
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [saving, setSaving] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetchRole();
    }
  }, [status]);

  useEffect(() => {
    if (role === "admin") {
      loadGigs();
    }
  }, [role]);

  async function fetchRole() {
    try {
      const res = await axios.get("/api/user/profile");
      const apiRole = res.data?.user?.role || "unknown";
      const email = res.data?.user?.email;
      if (email && ALLOWED_ADMIN_EMAILS.includes(email)) {
        setRole("admin");
      } else {
        setRole(apiRole);
      }
    } catch (err) {
      const email = session?.user?.email;
      if (email && ALLOWED_ADMIN_EMAILS.includes(email)) {
        setRole("admin");
      } else {
        setRole("unknown");
      }
    }
  }

  async function loadGigs() {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get("/api/gigs?limit=100&sort=recent");
      setGigs(data.gigs || []);
    } catch (err) {
      setError("No se pudieron cargar los gigs");
    } finally {
      setLoading(false);
    }
  }

  async function seedDefaults() {
    setSeeding(true);
    setError("");
    try {
      await axios.post("/api/admin/seed-default-gigs");
      await loadGigs();
    } catch (err) {
      setError("No se pudo ejecutar el seed");
    } finally {
      setSeeding(false);
    }
  }

  async function saveGig(gigId, payload) {
    if (!gigId) return;
    setSaving((prev) => ({ ...prev, [gigId]: true }));
    setError("");
    try {
      await axios.patch(`/api/gigs/${gigId}`, payload);
      await loadGigs();
    } catch (err) {
      setError("No se pudo guardar el gig");
    } finally {
      setSaving((prev) => ({ ...prev, [gigId]: false }));
    }
  }

  if (status === "loading" || role === "loading") {
    return <p className="p-8">Cargando...</p>;
  }

  if (role !== "admin") {
    return (
      <main className="min-h-screen p-8">
        <p className="text-error">Acceso solo para administradores.</p>
        <Link href="/dashboard" className="link mt-4 inline-block">
          Volver al dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8 pb-24">
      <section className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold">Admin Panel</h1>
            <p className="text-base-content/60">Seed y edición rápida de gigs</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard" className="btn btn-ghost">Volver</Link>
            <button
              className="btn btn-primary"
              onClick={seedDefaults}
              disabled={seeding}
            >
              {seeding ? "Seeding..." : "Seed defaults"}
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <p>Cargando gigs...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Categoría</th>
                  <th>Precio básico</th>
                  <th>Activo</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {gigs.map((gig) => {
                  const price = gig.packages?.basic?.price || 0;
                  return (
                    <tr key={gig._id || gig.title}>
                      <td className="max-w-xs">
                        <input
                          defaultValue={gig.title}
                          className="input input-bordered input-sm w-full"
                          onBlur={(e) =>
                            saveGig(gig._id, { title: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <select
                          className="select select-bordered select-sm"
                          defaultValue={gig.category}
                          onChange={(e) =>
                            saveGig(gig._id, { category: e.target.value })
                          }
                        >
                          {config.categories.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="w-32">
                        <input
                          type="number"
                          min={5}
                          defaultValue={price}
                          className="input input-bordered input-sm w-full"
                          onBlur={(e) =>
                            saveGig(gig._id, {
                              packages: {
                                basic: { price: Number(e.target.value || 5) },
                              },
                            })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          className="toggle"
                          defaultChecked={gig.isActive}
                          onChange={(e) =>
                            saveGig(gig._id, { isActive: e.target.checked })
                          }
                        />
                      </td>
                      <td>
                        <Link
                          href={`/gigs/${gig._id}`}
                          className="btn btn-sm"
                        >
                          Ver
                        </Link>
                      </td>
                      <td className="text-xs text-base-content/50">
                        {saving[gig._id] ? "Guardando..." : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
