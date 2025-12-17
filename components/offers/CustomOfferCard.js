"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import apiClient from "@/libs/api";
import { toast } from "react-hot-toast";

/* CustomOfferCard START */
export default function CustomOfferCard({ offer, onUpdate }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const isClient = session?.user?.id === offer.clientId?._id || session?.user?.id === offer.clientId;
  const isExpired = offer.status === 'expired' || (offer.expiresAt && new Date(offer.expiresAt) < new Date());
  const isPending = offer.status === 'pending' && !isExpired;

  const handleAccept = async () => {
    if (!confirm("Accept this custom offer? This will create an order.")) return;

    setLoading(true);
    try {
      const response = await apiClient.post(`/api/offers/${offer._id}/accept`);
      toast.success("Offer accepted! Order created.");
      onUpdate?.(response.data.offer);
    } catch (error) {
      console.error("Error accepting offer:", error);
      toast.error(error.response?.data?.error || "Failed to accept offer");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (rejectionReason.trim().length < 5) {
      toast.error("Please provide a reason (at least 5 characters)");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post(`/api/offers/${offer._id}/reject`, {
        reason: rejectionReason
      });
      toast.success("Offer rejected");
      onUpdate?.(response.data.offer);
      setShowRejectModal(false);
    } catch (error) {
      console.error("Error rejecting offer:", error);
      toast.error(error.response?.data?.error || "Failed to reject offer");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    const badges = {
      pending: "badge-warning",
      accepted: "badge-success",
      rejected: "badge-error",
      expired: "badge-ghost",
      converted: "badge-info"
    };

    return (
      <span className={`badge ${badges[offer.status] || "badge-ghost"} capitalize`}>
        {offer.status}
      </span>
    );
  };

  const formatExpiryDate = () => {
    if (!offer.expiresAt) return null;
    const date = new Date(offer.expiresAt);
    const now = new Date();
    const diffMs = date - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) return "Expired";
    if (diffHours < 24) return `Expires in ${diffHours}h`;
    return `Expires in ${diffDays}d`;
  };

  return (
    <>
      <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-4 space-y-3 max-w-md">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold text-lg">{offer.title}</h4>
            <p className="text-xs text-base-content/60">Custom Offer</p>
          </div>
          {getStatusBadge()}
        </div>

        {/* Description */}
        <p className="text-sm text-base-content/80 whitespace-pre-wrap">
          {offer.description}
        </p>

        {/* Details Grid */}
        <div className="grid grid-cols-3 gap-2 text-center py-3 bg-base-100 rounded-lg">
          <div>
            <p className="text-2xl font-bold text-primary">${offer.price}</p>
            <p className="text-xs text-base-content/60">Price</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{offer.deliveryDays}</p>
            <p className="text-xs text-base-content/60">Days</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{offer.revisions}</p>
            <p className="text-xs text-base-content/60">Revisions</p>
          </div>
        </div>

        {/* Expiry Info */}
        {isPending && (
          <div className="text-xs text-base-content/60 text-center">
            {formatExpiryDate()}
          </div>
        )}

        {/* Actions for Client */}
        {isClient && isPending && (
          <div className="flex gap-2">
            <button
              onClick={handleAccept}
              className="btn btn-primary btn-sm flex-1"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                "Accept Offer"
              )}
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              className="btn btn-outline btn-error btn-sm flex-1"
              disabled={loading}
            >
              Reject
            </button>
          </div>
        )}

        {/* Status Messages */}
        {offer.status === 'accepted' && (
          <div className="alert alert-success text-sm py-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Offer accepted - Order created!</span>
          </div>
        )}

        {offer.status === 'rejected' && offer.rejectionReason && (
          <div className="alert alert-error text-sm py-2">
            <span className="text-xs">Rejected: {offer.rejectionReason}</span>
          </div>
        )}

        {isExpired && (
          <div className="alert alert-warning text-sm py-2">
            <span>This offer has expired</span>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-lg max-w-md w-full p-6 space-y-4">
            <h3 className="text-xl font-bold">Reject Offer</h3>
            <p className="text-sm text-base-content/60">
              Please provide a reason for rejecting this offer
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="E.g., Price is too high, timeline doesn't work for me..."
              className="textarea textarea-bordered w-full h-24"
              minLength={5}
              maxLength={500}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRejectModal(false)}
                className="btn btn-ghost"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="btn btn-error"
                disabled={loading || rejectionReason.trim().length < 5}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Rejecting...
                  </>
                ) : (
                  "Reject Offer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
/* CustomOfferCard END */
