"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import PackageSelector from "@/components/gigs/PackageSelector";

export default function SingleGigPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchGig();
    }
  }, [params.id]);

  const fetchGig = async () => {
    try {
      const { data } = await axios.get(`/api/gigs/${params.id}`);
      setGig(data.gig);
    } catch (error) {
      console.error("Error fetching gig:", error);
      toast.error("Failed to load gig");
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async (packageType) => {
    if (status === "unauthenticated") {
      toast.error("Please sign in to order");
      router.push("/api/auth/signin");
      return;
    }

    setOrdering(true);
    try {
      const { data } = await axios.post(`/api/gigs/${params.id}/order`, {
        packageType,
      });

      toast.success("Order created successfully!");
      router.push("/dashboard/orders");
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(error.response?.data?.error || "Failed to create order");
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Gig not found</h1>
        <Link href="/gigs" className="btn btn-primary">
          Browse Gigs
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-7xl mx-auto">
        {/* Single Gig Page START */}

        {/* Breadcrumb */}
        <div className="text-sm breadcrumbs mb-6">
          <ul>
            <li>
              <Link href="/gigs">Gigs</Link>
            </li>
            <li>{gig.title}</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Gig Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-extrabold">
              {gig.title}
            </h1>

            {/* Freelancer Info */}
            <div className="flex items-center gap-4">
              <div className="avatar">
                <div className="w-12 h-12 rounded-full">
                  {gig.freelancerId?.image ? (
                    <Image
                      src={gig.freelancerId.image}
                      alt={gig.freelancerId.name}
                      width={48}
                      height={48}
                    />
                  ) : (
                    <div className="bg-primary text-primary-content flex items-center justify-center text-lg">
                      {gig.freelancerId?.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Link
                  href={`/profile/${gig.freelancerId?._id}`}
                  className="font-semibold hover:underline"
                >
                  {gig.freelancerId?.name || "Unknown"}
                </Link>
                <div className="flex items-center gap-2 text-sm text-base-content/60">
                  {gig.freelancerId?.rating > 0 ? (
                    <>
                      <span className="text-warning">★</span>
                      <span>{gig.freelancerId.rating.toFixed(1)}</span>
                      <span>({gig.freelancerId.reviewCount} reviews)</span>
                    </>
                  ) : (
                    <span>New seller</span>
                  )}
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            {gig.images && gig.images.length > 0 && (
              <div className="space-y-2">
                {/* Main Image */}
                <div className="relative h-96 bg-base-300 rounded-lg overflow-hidden">
                  <Image
                    src={gig.images[currentImageIndex].url}
                    alt={`${gig.title} - Image ${currentImageIndex + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Thumbnails */}
                {gig.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {gig.images.map((img, idx) => (
                      <button
                        key={idx}
                        className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
                          currentImageIndex === idx
                            ? "ring-2 ring-primary"
                            : "opacity-60 hover:opacity-100"
                        }`}
                        onClick={() => setCurrentImageIndex(idx)}
                      >
                        <Image
                          src={img.url}
                          alt={`Thumbnail ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="card bg-base-200">
              <div className="card-body">
                <h2 className="card-title">About This Gig</h2>
                <p className="whitespace-pre-wrap">{gig.description}</p>
              </div>
            </div>

            {/* Freelancer Bio */}
            {gig.freelancerId?.bio && (
              <div className="card bg-base-200">
                <div className="card-body">
                  <h2 className="card-title">About the Freelancer</h2>
                  <p>{gig.freelancerId.bio}</p>

                  {/* Skills */}
                  {gig.freelancerId.skills &&
                    gig.freelancerId.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {gig.freelancerId.skills.map((skill, idx) => (
                          <span key={idx} className="badge badge-outline">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="stats stats-vertical lg:stats-horizontal shadow bg-base-200 w-full">
              <div className="stat">
                <div className="stat-title">Views</div>
                <div className="stat-value text-primary">{gig.views}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Orders</div>
                <div className="stat-value text-secondary">{gig.orders}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Rating</div>
                <div className="stat-value">
                  {gig.rating > 0 ? gig.rating.toFixed(1) : "N/A"}
                </div>
                <div className="stat-desc">
                  {gig.reviewCount} review{gig.reviewCount !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Packages */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <PackageSelector
                packages={gig.packages}
                onOrder={handleOrder}
                loading={ordering}
              />
            </div>
          </div>
        </div>

        {/* Single Gig Page END */}
      </section>
    </main>
  );
}
