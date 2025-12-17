"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import apiClient from "@/libs/api";
import OrderCard from "./OrderCard";
import { toast } from "react-hot-toast";

/* OrderList START */
export default function OrderList({ role = "client", status = "all" }) {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchOrders();
  }, [role, status, pagination.page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        role,
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      if (status && status !== "all") {
        params.append("status", status);
      }

      const response = await apiClient.get(`/api/orders?${params}`);
      setOrders(response.data.orders);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card bg-base-100 border border-base-300">
            <div className="card-body p-4">
              <div className="flex items-center gap-4">
                <div className="skeleton w-12 h-12 rounded-full shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-3/4"></div>
                  <div className="skeleton h-3 w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 mx-auto text-base-content/20 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="text-lg font-semibold mb-2">No orders found</h3>
        <p className="text-base-content/60">
          {status === "all"
            ? "You don't have any orders yet"
            : `No ${status} orders found`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="btn btn-sm"
          >
            Previous
          </button>

          <div className="flex gap-1">
            {[...Array(pagination.pages)].map((_, i) => {
              const page = i + 1;
              // Show first, last, current, and adjacent pages
              if (
                page === 1 ||
                page === pagination.pages ||
                (page >= pagination.page - 1 && page <= pagination.page + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`btn btn-sm ${
                      pagination.page === page ? "btn-primary" : ""
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                page === pagination.page - 2 ||
                page === pagination.page + 2
              ) {
                return (
                  <span key={page} className="flex items-center px-2">
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="btn btn-sm"
          >
            Next
          </button>
        </div>
      )}

      {/* Results info */}
      <p className="text-center text-sm text-base-content/60">
        Showing {orders.length} of {pagination.total} orders
      </p>
    </div>
  );
}
/* OrderList END */
