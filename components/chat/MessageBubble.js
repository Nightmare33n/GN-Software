"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";

export default function MessageBubble({ message }) {
  const { data: session } = useSession();
  const isOwn = message.senderId._id === session?.user?.id;

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

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
