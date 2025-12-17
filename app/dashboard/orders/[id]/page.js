"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import apiClient from "@/libs/api";
import OrderTimeline from "@/components/orders/OrderTimeline";
import DeliveryForm from "@/components/orders/DeliveryForm";
import { toast } from "react-hot-toast";

/* Order Detail Page START */
export default function OrderDetailPage({ params }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionReason, setRevisionReason] = useState("");

  const isFreelancer = session?.user?.id === order?.freelancerId?._id;
  const isClient = session?.user?.id === order?.clientId?._id;

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/orders/${params.id}`);
      setOrder(response.data.order);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to load order");
      router.push("/dashboard/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!confirm(`Change order status to ${newStatus}?`)) return;

    setActionLoading(true);
    try {
      const response = await apiClient.patch(`/api/orders/${order._id}`, {
        status: newStatus
      });
      setOrder(response.data.order);
      toast.success("Order updated successfully");
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error(error.response?.data?.error || "Failed to update order");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestRevision = async () => {
    if (revisionReason.trim().length < 10) {
      toast.error("Please provide a detailed reason (at least 10 characters)");
      return;
    }

    setActionLoading(true);
    try {
      const response = await apiClient.post(`/api/orders/${order._id}/request-revision`, {
        reason: revisionReason
      });
      setOrder(response.data.order);
      toast.success("Revision requested");
      setShowRevisionModal(false);
      setRevisionReason("");
    } catch (error) {
      console.error("Error requesting revision:", error);
      toast.error(error.response?.data?.error || "Failed to request revision");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeliverySuccess = (updatedOrder) => {
    setOrder(updatedOrder);
    setShowDeliveryForm(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-base-300 rounded w-1/4"></div>
          <div className="h-64 bg-base-300 rounded"></div>
          <div className="h-96 bg-base-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const otherUser = isFreelancer ? order.clientId : order.freelancerId;
  const revisionsRemaining = order.revisions - (order.revisionRequests?.length || 0);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Back Button */}
      <Link href="/dashboard/orders" className="btn btn-ghost btn-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Orders
      </Link>

      {/* Header */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">{order.title}</h1>
                <span className={`badge ${
                  order.status === 'completed' ? 'badge-success' :
                  order.status === 'cancelled' ? 'badge-error' :
                  order.status === 'delivered' ? 'badge-primary' :
                  order.status === 'revision' ? 'badge-secondary' :
                  order.status === 'in_progress' ? 'badge-info' :
                  'badge-warning'
                } capitalize`}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-base-content/60">Order #{order.orderNumber}</p>
            </div>

            <div className="text-right">
              <p className="text-3xl font-bold text-primary">${order.price}</p>
              <p className="text-sm text-base-content/60">{order.deliveryDays} days delivery</p>
            </div>
          </div>

          <div className="divider"></div>

          {/* Users Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="avatar">
                <div className="w-12 h-12 rounded-full">
                  {order.clientId.image ? (
                    <Image src={order.clientId.image} alt={order.clientId.name} width={48} height={48} />
                  ) : (
                    <div className="bg-primary/10 w-full h-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">
                        {order.clientId.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="font-semibold">{order.clientId.name}</p>
                <p className="text-sm text-base-content/60">Client</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="avatar">
                <div className="w-12 h-12 rounded-full">
                  {order.freelancerId.image ? (
                    <Image src={order.freelancerId.image} alt={order.freelancerId.name} width={48} height={48} />
                  ) : (
                    <div className="bg-primary/10 w-full h-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">
                        {order.freelancerId.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="font-semibold">{order.freelancerId.name}</p>
                <p className="text-sm text-base-content/60">Freelancer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h2 className="card-title">Description</h2>
              <p className="text-base-content/80 whitespace-pre-wrap">{order.description}</p>
            </div>
          </div>

          {/* Delivery Files */}
          {order.deliveryFiles && order.deliveryFiles.length > 0 && (
            <div className="card bg-base-100 border border-base-300">
              <div className="card-body">
                <h2 className="card-title">Delivery Files</h2>
                <div className="space-y-2">
                  {order.deliveryFiles.map((file, index) => (
                    <a
                      key={index}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1">
                        <p className="font-medium">{file.name}</p>
                        {file.size && (
                          <p className="text-xs text-base-content/60">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Delivery Form (for freelancer) */}
          {isFreelancer && (order.status === 'in_progress' || order.status === 'revision') && (
            <div>
              {!showDeliveryForm ? (
                <button
                  onClick={() => setShowDeliveryForm(true)}
                  className="btn btn-primary w-full"
                >
                  Deliver Order
                </button>
              ) : (
                <DeliveryForm order={order} onSuccess={handleDeliverySuccess} />
              )}
            </div>
          )}

          {/* Actions for Client */}
          {isClient && order.status === 'delivered' && (
            <div className="card bg-base-100 border border-base-300">
              <div className="card-body">
                <h2 className="card-title">Review Delivery</h2>
                <p className="text-sm text-base-content/60 mb-4">
                  Review the delivered files and either accept or request revisions
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleStatusUpdate('completed')}
                    className="btn btn-success flex-1"
                    disabled={actionLoading}
                  >
                    Accept & Complete
                  </button>
                  {revisionsRemaining > 0 && (
                    <button
                      onClick={() => setShowRevisionModal(true)}
                      className="btn btn-warning flex-1"
                      disabled={actionLoading}
                    >
                      Request Revision ({revisionsRemaining} left)
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Start Work (for freelancer) */}
          {isFreelancer && order.status === 'pending' && (
            <button
              onClick={() => handleStatusUpdate('in_progress')}
              className="btn btn-primary w-full"
              disabled={actionLoading}
            >
              Start Working on Order
            </button>
          )}
        </div>

        {/* Right Column - Timeline & Info */}
        <div className="space-y-6">
          <OrderTimeline order={order} />

          {/* Order Info Card */}
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h3 className="card-title text-base">Order Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-base-content/60">Type:</span>
                  <span className="font-semibold capitalize">{order.orderType}</span>
                </div>
                {order.packageType && (
                  <div className="flex justify-between">
                    <span className="text-base-content/60">Package:</span>
                    <span className="font-semibold capitalize">{order.packageType}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-base-content/60">Revisions:</span>
                  <span className="font-semibold">
                    {revisionsRemaining} / {order.revisions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/60">Created:</span>
                  <span className="font-semibold">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <Link
                href={`/dashboard/${isFreelancer ? 'freelancer' : 'client'}?conversation=${order.conversationId}`}
                className="btn btn-outline btn-sm mt-4"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Open Chat
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Revision Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-lg max-w-md w-full p-6 space-y-4">
            <h3 className="text-xl font-bold">Request Revision</h3>
            <p className="text-sm text-base-content/60">
              Please describe what needs to be changed or improved
            </p>
            <textarea
              value={revisionReason}
              onChange={(e) => setRevisionReason(e.target.value)}
              placeholder="E.g., Please change the colors to match our brand, the layout needs to be more responsive..."
              className="textarea textarea-bordered w-full h-32"
              minLength={10}
              maxLength={1000}
            />
            <p className="text-xs text-base-content/60 text-right">
              {revisionReason.length}/1000 characters
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRevisionModal(false)}
                className="btn btn-ghost"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleRequestRevision}
                className="btn btn-warning"
                disabled={actionLoading || revisionReason.trim().length < 10}
              >
                {actionLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Requesting...
                  </>
                ) : (
                  "Request Revision"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
/* Order Detail Page END */
