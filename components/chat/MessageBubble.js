"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import CustomOfferCard from "@/components/offers/CustomOfferCard";
import apiClient from "@/libs/api";

export default function MessageBubble({ message }) {
  const { data: session } = useSession();
  const [offer, setOffer] = useState(null);
  const [loadingOffer, setLoadingOffer] = useState(false);
  const isOwn = message.senderId._id === session?.user?.id;

  // Fetch offer details if this is an offer message
  useEffect(() => {
    if (message.messageType === 'offer' && message.customOfferId) {
      fetchOffer();
    }
  }, [message.customOfferId]);

  const fetchOffer = async () => {
    setLoadingOffer(true);
    try {
      const response = await apiClient.get(`/api/offers/${message.customOfferId}`);
      setOffer(response.data.offer);
    } catch (error) {
      console.error("Error fetching offer:", error);
    } finally {
      setLoadingOffer(false);
    }
  };

  const handleOfferUpdate = (updatedOffer) => {
    setOffer(updatedOffer);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Special rendering for offer messages
  if (message.messageType === 'offer') {
    return (
      <div className={`flex gap-3 mb-6 ${isOwn ? "flex-row-reverse" : ""}`}>
        {/* MessageBubble START - Offer Type */}

        {/* Avatar */}
        <div className="avatar flex-shrink-0">
          <div className="w-8 h-8 rounded-full">
            {message.senderId.image ? (
              <Image
                src={message.senderId.image}
                alt={message.senderId.name}
                width={32}
                height={32}
              />
            ) : (
              <div className="bg-primary text-primary-content flex items-center justify-center text-sm">
                {message.senderId.name?.charAt(0) || "?"}
              </div>
            )}
          </div>
        </div>

        {/* Offer Card */}
        <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
          {!isOwn && (
            <span className="text-xs text-base-content/60 mb-2 px-2">
              {message.senderId.name}
            </span>
          )}

          {loadingOffer ? (
            <div className="bg-base-200 rounded-lg p-6 w-96">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          ) : offer ? (
            <CustomOfferCard offer={offer} onUpdate={handleOfferUpdate} />
          ) : (
            <div className="bg-base-200 rounded-lg p-4">
              <p className="text-sm text-base-content/60">Offer not found</p>
            </div>
          )}

          <span className="text-xs text-base-content/40 mt-2 px-2">
            {formatTime(message.createdAt)}
          </span>
        </div>

        {/* MessageBubble END - Offer Type */}
      </div>
    );
  }

  // Normal message rendering
  return (
    <div className={`flex gap-3 mb-4 ${isOwn ? "flex-row-reverse" : ""}`}>
      {/* MessageBubble START */}

      {/* Avatar */}
      <div className="avatar flex-shrink-0">
        <div className="w-8 h-8 rounded-full">
          {message.senderId.image ? (
            <Image
              src={message.senderId.image}
              alt={message.senderId.name}
              width={32}
              height={32}
            />
          ) : (
            <div className="bg-primary text-primary-content flex items-center justify-center text-sm">
              {message.senderId.name?.charAt(0) || "?"}
            </div>
          )}
        </div>
      </div>

      {/* Message content */}
      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%]`}>
        {/* Sender name (only for received messages) */}
        {!isOwn && (
          <span className="text-xs text-base-content/60 mb-1 px-2">
            {message.senderId.name}
          </span>
        )}

        {/* Message bubble */}
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwn
              ? "bg-primary text-primary-content rounded-br-sm"
              : "bg-base-200 text-base-content rounded-bl-sm"
          }`}
        >
          {message.messageType === "text" && (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          )}

          {message.messageType === "file" && (
            <div>
              <p className="mb-2">{message.content}</p>
              <a
                href={message.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                📎 {message.fileName}
              </a>
            </div>
          )}

          {message.messageType === "system" && (
            <p className="text-sm italic opacity-80">{message.content}</p>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-xs text-base-content/40 mt-1 px-2">
          {formatTime(message.createdAt)}
          {isOwn && message.isRead && (
            <span className="ml-1">✓✓</span>
          )}
        </span>
      </div>

      {/* MessageBubble END */}
    </div>
  );
}
