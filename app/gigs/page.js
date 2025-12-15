"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import GigCard from "@/components/gigs/GigCard";
import GigFilters from "@/components/gigs/GigFilters";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function BrowseGigsPage() {
  const { data: session } = useSession();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState({
    category: "all",
    search: "",
    sort: "recent",
  });

  useEffect(() => {
    fetchGigs();
  }, [filters, pagination.page]);

  const fetchGigs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sort: filters.sort,
      });

      if (filters.category && filters.category !== "all") {
        params.append("category", filters.category);
      }

      if (filters.search) {
        params.append("search", filters.search);
      }

      const { data } = await axios.get(`/api/gigs?${params.toString()}`);
      setGigs(data.gigs);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching gigs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
    setPagination({ ...pagination, page: 1 }); // Reset to page 1
  };

  const handleSortChange = (sort) => {
    setFilters({ ...filters, sort });
    setPagination({ ...pagination, page: 1 });
  };

  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-7xl mx-auto">
        {/* Browse Gigs Page START */}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold">
              Browse Services
            </h1>
            <p className="text-base-content/60 mt-2">
              Find the perfect freelance service for your project
            </p>
          </div>

          {session && (
            <Link href="/dashboard" className="btn btn-outline">
              My Dashboard
            </Link>
          )}
        </div>

        {/* Filters and Sort */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            <GigFilters
              onFilterChange={handleFilterChange}
              initialCategory={filters.category}
              initialSearch={filters.search}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Sort by</span>
            </label>
            <select
              className="select select-bordered"
              value={filters.sort}
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-base-content/60 mb-4">
            {pagination.total} {pagination.total === 1 ? "gig" : "gigs"} found
          </p>
        )}

        {/* Gigs Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card bg-base-200 h-80">
                <div className="skeleton h-48 w-full"></div>
                <div className="card-body">
                  <div className="skeleton h-4 w-3/4"></div>
                  <div className="skeleton h-4 w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : gigs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {gigs.map((gig) => (
                <GigCard key={gig._id} gig={gig} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="join">
                  <button
                    className="join-item btn"
                    onClick={() =>
                      setPagination({ ...pagination, page: pagination.page - 1 })
                    }
                    disabled={pagination.page === 1}
                  >
                    «
                  </button>
                  <button className="join-item btn">
                    Page {pagination.page} of {pagination.pages}
                  </button>
                  <button
                    className="join-item btn"
                    onClick={() =>
                      setPagination({ ...pagination, page: pagination.page + 1 })
                    }
                    disabled={pagination.page === pagination.pages}
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-base-content/60">No gigs found</p>
            <p className="text-sm text-base-content/40 mt-2">
              Try adjusting your filters or search query
            </p>
          </div>
        )}

        {/* Browse Gigs Page END */}
      </section>
    </main>
  );
}
