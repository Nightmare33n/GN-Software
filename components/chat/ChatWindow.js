"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useSocket } from "@/libs/socket";
import MessageBubble from "./MessageBubble";
import CustomOfferForm from "@/components/offers/CustomOfferForm";
import Image from "next/image";
import toast from "react-hot-toast";

export default function ChatWindow({ conversation }) {
  const { data: session } = useSession();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const otherParticipant = conversation?.participants.find(
    p => p._id !== session?.user?.id
  );

  useEffect(() => {
    if (conversation?._id) {
      fetchMessages();
      markAsRead();
      joinConversation();
    }

    return () => {
      if (conversation?._id && socket) {
        socket.emit('leave_conversation', conversation._id);
      }
    };
  }, [conversation?._id]);

  // Socket.io listeners
  useEffect(() => {
    if (!socket || !conversation?._id) return;

    socket.on('new_message', (message) => {
      if (message.conversationId === conversation._id) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();

        // Mark as read if message is from other user
        if (message.senderId._id !== session?.user?.id) {
          markAsRead();
        }
      }
    });

    socket.on('user_typing', ({ userId, isTyping }) => {
      if (userId !== session?.user?.id) {
        setIsTyping(isTyping);
      }
    });

    socket.on('offer_accepted', ({ offerId, orderId }) => {
      // Refresh messages to show updated offer status
      fetchMessages();
      toast.success('Custom offer accepted!');
    });

    socket.on('offer_rejected', ({ offerId }) => {
      // Refresh messages to show updated offer status
      fetchMessages();
      toast.info('Custom offer rejected');
    });

    return () => {
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('offer_accepted');
      socket.off('offer_rejected');
    };
  }, [socket, conversation?._id, session?.user?.id]);

  const joinConversation = () => {
    if (socket && conversation?._id) {
      socket.emit('join_conversation', conversation._id);
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `/api/conversations/${conversation._id}/messages`
      );
      setMessages(data.messages);
      scrollToBottom();
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await axios.post(`/api/conversations/${conversation._id}/mark-read`);
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageInput.trim() || !socket) return;

    const content = messageInput.trim();
    setMessageInput("");
    setSending(true);

    try {
      // Send via Socket.io
      socket.emit('send_message', {
        conversationId: conversation._id,
        content,
        messageType: 'text',
      });

      // Stop typing indicator
      socket.emit('typing', {
        conversationId: conversation._id,
        isTyping: false,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setMessageInput(e.target.value);

    if (!socket) return;

    // Emit typing event
    socket.emit('typing', {
      conversationId: conversation._id,
      isTyping: true,
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', {
        conversationId: conversation._id,
        isTyping: false,
      });
    }, 1000);
  };

  const handleOfferSuccess = (offer) => {
    setShowOfferForm(false);
    toast.success('Custom offer sent!');
    // Messages will be updated via socket event
  };

  const isFreelancer = session?.user?.role === 'freelancer' || session?.user?.role === 'admin';

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full text-base-content/60">
        <div className="text-center">
          <p className="text-lg">No conversation selected</p>
          <p className="text-sm mt-2">Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* ChatWindow START */}

      {/* Header */}
      <div className="p-4 border-b border-base-300 bg-base-200">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-10 h-10 rounded-full">
                {otherParticipant?.image ? (
                  <Image
                    src={otherParticipant.image}
                    alt={otherParticipant.name}
                    width={40}
                    height={40}
                  />
                ) : (
                  <div className="bg-primary text-primary-content flex items-center justify-center">
                    {otherParticipant?.name?.charAt(0) || "?"}
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold">{otherParticipant?.name}</h3>
              <p className="text-xs text-base-content/60">
                {otherParticipant?.onlineStatus ? (
                  <span className="text-success">● Online</span>
                ) : (
                  <span>Offline</span>
                )}
              </p>
            </div>
          </div>

          {/* Create Offer Button (Freelancers only) */}
          {isFreelancer && (
            <button
              onClick={() => setShowOfferForm(true)}
              className="btn btn-primary btn-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Offer
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-base-100">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-base-content/60 py-8">
            <p>No messages yet</p>
            <p className="text-sm mt-2">Send a message to start the conversation</p>
          </div>
        ) : (
          <div>
            {messages.map((message) => (
              <MessageBubble key={message._id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-base-content/60 text-sm mb-2">
            <span className="loading loading-dots loading-sm"></span>
            <span>{otherParticipant?.name} is typing...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-base-300 bg-base-200">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            className="input input-bordered flex-1"
            placeholder="Type a message..."
            value={messageInput}
            onChange={handleTyping}
            disabled={sending}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!messageInput.trim() || sending}
          >
            {sending ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Send"
            )}
          </button>
        </form>
      </div>

      {/* ChatWindow END */}

      {/* Custom Offer Form Modal */}
      {showOfferForm && (
        <CustomOfferForm
          conversation={conversation}
          clientId={otherParticipant._id}
          onClose={() => setShowOfferForm(false)}
          onSuccess={handleOfferSuccess}
        />
      )}
    </div>
  );
}
