"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";

/* OrderCard START */
export default function OrderCard({ order }) {
  const { data: session } = useSession();
  const isFreelancer = session?.user?.id === order.freelancerId?._id;
  const otherUser = isFreelancer ? order.clientId : order.freelancerId;

  const statusColors = {
    pending: "badge-warning",
    in_progress: "badge-info",
    delivered: "badge-primary",
    revision: "badge-secondary",
    completed: "badge-success",
    cancelled: "badge-error"
  };

  const statusLabels = {
    pending: "Pending",
    in_progress: "In Progress",
    delivered: "Delivered",
    revision: "Revision Requested",
    completed: "Completed",
    cancelled: "Cancelled"
  };

  const calculateDaysRemaining = () => {
    if (!order.createdAt || !order.deliveryDays) return null;

    const created = new Date(order.createdAt);
    const deadline = new Date(created);
    deadline.setDate(deadline.getDate() + order.deliveryDays);

    const now = new Date();
    const diffMs = deadline - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (order.status === 'completed' || order.status === 'cancelled') {
      return null;
    }

    if (diffDays < 0) return `${Math.abs(diffDays)}d late`;
    if (diffDays === 0) return "Due today";
    return `${diffDays}d left`;
  };

  return (
    <Link href={`/dashboard/orders/${order._id}`}>
      <div className="card bg-base-100 border border-base-300 hover:border-primary hover:shadow-lg transition-all cursor-pointer">
        <div className="card-body p-4">
          {/* Header */}
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base truncate">{order.title}</h3>
              <p className="text-xs text-base-content/60">
                Order #{order.orderNumber}
              </p>
            </div>
            <span className={`badge ${statusColors[order.status]} badge-sm whitespace-nowrap`}>
              {statusLabels[order.status]}
            </span>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-2 mt-2">
            <div className="avatar">
              <div className="w-8 h-8 rounded-full">
                {otherUser?.image ? (
                  <Image
                    src={otherUser.image}
                    alt={otherUser.name}
                    width={32}
                    height={32}
                  />
                ) : (
                  <div className="bg-primary/10 w-full h-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">
                      {otherUser?.name?.charAt(0) || "?"}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{otherUser?.name}</p>
              <p className="text-xs text-base-content/60">
                {isFreelancer ? "Client" : "Freelancer"}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-base-300">
            <div>
              <p className="text-lg font-bold text-primary">${order.price}</p>
              <p className="text-xs text-base-content/60">Price</p>
            </div>
            <div>
              <p className="text-lg font-bold">{order.deliveryDays}d</p>
              <p className="text-xs text-base-content/60">Delivery</p>
            </div>
            <div>
              <p className="text-lg font-bold">
                {order.revisions - (order.revisionRequests?.length || 0)}
              </p>
              <p className="text-xs text-base-content/60">Revisions</p>
            </div>
          </div>

          {/* Time Remaining */}
          {calculateDaysRemaining() && (
            <div className="mt-2">
              <div className="badge badge-outline badge-sm">
                {calculateDaysRemaining()}
              </div>
            </div>
          )}

          {/* Type Badge */}
          <div className="flex gap-2 mt-2">
            {order.orderType === 'custom' && (
              <span className="badge badge-ghost badge-xs">Custom Offer</span>
            )}
            {order.orderType === 'gig' && order.packageType && (
              <span className="badge badge-ghost badge-xs capitalize">
                {order.packageType} Package
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
/* OrderCard END */
