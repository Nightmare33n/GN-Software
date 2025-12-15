"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useSocket } from "@/libs/socket";

export default function ConversationList({ activeConversationId, onSelectConversation }) {
  const { data: session } = useSession();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchConversations();
  }, []);

  // Listen for conversation updates via Socket.io
  useEffect(() => {
    if (!socket) return;

    socket.on('conversation_updated', (data) => {
      setConversations(prev => {
        const index = prev.findIndex(c => c._id === data.conversationId);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            lastMessage: data.lastMessage,
            unreadCount: data.unreadCount || 0,
          };
          // Move to top
          updated.sort((a, b) => {
            const timeA = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp) : new Date(0);
            const timeB = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp) : new Date(0);
            return timeB - timeA;
          });
          return updated;
        }
        return prev;
      });
    });

    return () => {
      socket.off('conversation_updated');
    };
  }, [socket]);

  const fetchConversations = async () => {
    try {
      const { data } = await axios.get("/api/conversations");
      setConversations(data.conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(
      p => p._id !== session?.user?.id
    );
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations.filter(conv => {
    const other = getOtherParticipant(conv);
    return other?.name?.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* ConversationList START */}

      {/* Search */}
      <div className="p-4 border-b border-base-300">
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-8 text-base-content/60">
            <p>No conversations yet</p>
            <p className="text-sm mt-2">Start by browsing gigs</p>
          </div>
        ) : (
          <div>
            {filteredConversations.map((conversation) => {
              const other = getOtherParticipant(conversation);
              const isActive = conversation._id === activeConversationId;

              return (
                <button
                  key={conversation._id}
                  className={`w-full p-4 border-b border-base-300 hover:bg-base-200 transition-colors text-left ${
                    isActive ? "bg-base-200" : ""
                  }`}
                  onClick={() => onSelectConversation(conversation)}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="avatar">
                        <div className="w-12 h-12 rounded-full">
                          {other?.image ? (
                            <Image
                              src={other.image}
                              alt={other.name}
                              width={48}
                              height={48}
                            />
                          ) : (
                            <div className="bg-primary text-primary-content flex items-center justify-center text-lg">
                              {other?.name?.charAt(0) || "?"}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Online indicator */}
                      {other?.onlineStatus && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100"></div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold truncate">
                          {other?.name || "Unknown User"}
                        </span>
                        {conversation.lastMessage?.timestamp && (
                          <span className="text-xs text-base-content/60 ml-2">
                            {formatTime(conversation.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>

                      {conversation.lastMessage?.content && (
                        <p className="text-sm text-base-content/70 truncate">
                          {conversation.lastMessage.content}
                        </p>
                      )}
                    </div>

                    {/* Unread badge */}
                    {conversation.unreadCount > 0 && (
                      <div className="badge badge-primary badge-sm">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ConversationList END */}
    </div>
  );
}
