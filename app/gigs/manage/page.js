"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";

export default function ManageGigsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
      return;
    }

    if (status === "authenticated") {
      fetchMyGigs();
    }
  }, [status]);

  const fetchMyGigs = async () => {
    try {
      // Fetch user profile to get their gigs
      const { data: profileData } = await axios.get("/api/user/profile");

      // Check if user can create gigs
      if (profileData.user.role !== "freelancer" && profileData.user.role !== "admin") {
        toast.error("Only freelancers can manage gigs");
        router.push("/dashboard");
        return;
      }

      // Fetch all gigs and filter by current user
      const { data } = await axios.get("/api/gigs?limit=100");
      const myGigs = data.gigs.filter(
        (gig) => gig.freelancerId._id === profileData.user.id
      );

      setGigs(myGigs);
    } catch (error) {
      console.error("Error fetching gigs:", error);
      toast.error("Failed to load gigs");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (gigId, currentStatus) => {
    try {
      await axios.patch(`/api/gigs/${gigId}`, {
        isActive: !currentStatus,
      });

      toast.success(`Gig ${!currentStatus ? "activated" : "deactivated"}`);
      fetchMyGigs();
    } catch (error) {
      console.error("Error toggling gig status:", error);
      toast.error("Failed to update gig");
    }
  };

  const deleteGig = async (gigId) => {
    if (!confirm("Are you sure you want to delete this gig?")) {
      return;
    }

    try {
      await axios.delete(`/api/gigs/${gigId}`);
      toast.success("Gig deleted successfully");
      fetchMyGigs();
    } catch (error) {
      console.error("Error deleting gig:", error);
      toast.error("Failed to delete gig");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-7xl mx-auto">
        {/* Manage Gigs Page START */}

        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold">
                Manage Gigs
              </h1>
              <p className="text-base-content/60 mt-2">
                {gigs.length} gig{gigs.length !== 1 ? "s" : ""} total
              </p>
            </div>

            <div className="flex gap-2">
              <Link href="/dashboard" className="btn btn-outline">
                Dashboard
              </Link>
              <Link href="/gigs/create" className="btn btn-primary">
                Create New Gig
              </Link>
            </div>
          </div>

          {/* Gigs List */}
          {gigs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-base-content/60 mb-4">
                You haven&apos;t created any gigs yet
              </p>
              <Link href="/gigs/create" className="btn btn-primary">
                Create Your First Gig
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {gigs.map((gig) => (
                <div
                  key={gig._id}
                  className="card bg-base-200 hover:shadow-lg transition-shadow"
                >
                  <div className="card-body">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Image */}
                      <div className="relative w-full md:w-48 h-32 bg-base-300 rounded-lg overflow-hidden flex-shrink-0">
                        {gig.images && gig.images.length > 0 ? (
                          <Image
                            src={gig.images[0].url}
                            alt={gig.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-base-content/30">
                            No image
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold mb-2">
                              {gig.title}
                            </h3>
                            <div className="flex flex-wrap gap-2 text-sm text-base-content/60 mb-2">
                              <span className="badge badge-outline">
                                {gig.category}
                              </span>
                              <span>
                                Starting at ${gig.packages?.basic?.price || 0}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`badge ${
                                gig.isActive ? "badge-success" : "badge-error"
                              }`}
                            >
                              {gig.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-4 text-sm mb-4">
                          <span>👁️ {gig.views} views</span>
                          <span>📦 {gig.orders} orders</span>
                          <span>
                            ⭐ {gig.rating > 0 ? gig.rating.toFixed(1) : "N/A"}{" "}
                            ({gig.reviewCount})
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/gigs/${gig._id}`}
                            className="btn btn-sm btn-outline"
                          >
                            View
                          </Link>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() =>
                              toast.info("Edit functionality coming soon")
                            }
                          >
                            Edit
                          </button>
                          <button
                            className={`btn btn-sm ${
                              gig.isActive ? "btn-warning" : "btn-success"
                            }`}
                            onClick={() => toggleActive(gig._id, gig.isActive)}
                          >
                            {gig.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            className="btn btn-sm btn-error"
                            onClick={() => deleteGig(gig._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Manage Gigs Page END */}
      </section>
    </main>
  );
}
