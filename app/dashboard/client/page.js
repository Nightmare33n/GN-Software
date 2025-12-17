"use client";

import { useState } from "react";
import ButtonAccount from "@/components/ButtonAccount";
import Link from "next/link";
import ConversationList from "@/components/chat/ConversationList";
import ChatWindow from "@/components/chat/ChatWindow";
import AdminFab from "@/components/AdminFab";

export default function ClientDashboard() {
  const [selectedConversation, setSelectedConversation] = useState(null);

  return (
    <main className="min-h-screen p-4 md:p-8 pb-24">
      <section className="max-w-7xl mx-auto space-y-6">
        {/* Client Dashboard START */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold">
              Client Dashboard
            </h1>
            <p className="text-base-content/60 mt-2 text-sm md:text-base">
              Browse services, manage orders, and chat with freelancers
            </p>
          </div>
          <ButtonAccount />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/gigs" className="card bg-primary text-primary-content hover:shadow-lg transition-shadow">
            <div className="card-body p-4">
              <h2 className="card-title text-base">Browse Gigs</h2>
              <p className="text-sm">Find services you need</p>
            </div>
          </Link>

          <Link href="/dashboard/orders" className="card bg-base-200 hover:shadow-lg transition-shadow">
            <div className="card-body p-4">
              <h2 className="card-title text-base">My Orders</h2>
              <p className="text-sm">Track your active orders</p>
            </div>
          </Link>

          <Link href="/settings" className="card bg-base-200 hover:shadow-lg transition-shadow">
            <div className="card-body p-4">
              <h2 className="card-title text-base">Settings</h2>
              <p className="text-sm">Manage your profile</p>
            </div>
          </Link>
        </div>

        {/* Chat Section */}
        <div className="card bg-base-200">
          <div className="card-body p-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 h-[600px]">
              {/* Conversation List */}
              <div className="border-r border-base-300">
                <ConversationList
                  activeConversationId={selectedConversation?._id}
                  onSelectConversation={setSelectedConversation}
                />
              </div>

              {/* Chat Window */}
              <div className="lg:col-span-2">
                <ChatWindow conversation={selectedConversation} />
              </div>
            </div>
          </div>
        </div>
        {/* Client Dashboard END */}
      </section>
      <AdminFab />
    </main>
  );
}
