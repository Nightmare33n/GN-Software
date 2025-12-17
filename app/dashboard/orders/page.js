"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import OrderList from "@/components/orders/OrderList";

/* Orders Dashboard Page START */
export default function OrdersPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("status") || "all");
  const [roleView, setRoleView] = useState(
    session?.user?.role === "freelancer" || session?.user?.role === "admin"
      ? "freelancer"
      : "client"
  );

  const statusTabs = [
    { value: "all", label: "All Orders", color: "" },
    { value: "pending", label: "Pending", color: "text-warning" },
    { value: "in_progress", label: "In Progress", color: "text-info" },
    { value: "delivered", label: "Delivered", color: "text-primary" },
    { value: "revision", label: "Revisions", color: "text-secondary" },
    { value: "completed", label: "Completed", color: "text-success" },
    { value: "cancelled", label: "Cancelled", color: "text-error" }
  ];

  const canSwitchRole = session?.user?.role === "admin" || session?.user?.role === "freelancer";

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-base-content/60 mt-1">
            Manage and track your orders
          </p>
        </div>

        {/* Role Switcher (for freelancers/admins) */}
        {canSwitchRole && (
          <div className="flex gap-2">
            <button
              onClick={() => setRoleView("freelancer")}
              className={`btn btn-sm ${
                roleView === "freelancer" ? "btn-primary" : "btn-ghost"
              }`}
            >
              As Freelancer
            </button>
            <button
              onClick={() => setRoleView("client")}
              className={`btn btn-sm ${
                roleView === "client" ? "btn-primary" : "btn-ghost"
              }`}
            >
              As Client
            </button>
          </div>
        )}
      </div>

      {/* Status Tabs */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-0">
          {/* Desktop Tabs */}
          <div className="hidden md:flex overflow-x-auto border-b border-base-300">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`
                  px-6 py-4 font-medium whitespace-nowrap transition-colors
                  ${activeTab === tab.value
                    ? "border-b-2 border-primary text-primary"
                    : "text-base-content/60 hover:text-base-content"
                  }
                  ${tab.color && activeTab === tab.value ? tab.color : ""}
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mobile Dropdown */}
          <div className="md:hidden p-4 border-b border-base-300">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="select select-bordered w-full"
            >
              {statusTabs.map((tab) => (
                <option key={tab.value} value={tab.value}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>

          {/* Orders List */}
          <div className="p-6">
            <OrderList role={roleView} status={activeTab} />
          </div>
        </div>
      </div>
    </div>
  );
}
/* Orders Dashboard Page END */
