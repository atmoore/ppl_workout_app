"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { WorkoutHeader } from "@/components/workout-header";

export default function ChatPage() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const [workoutName, setWorkoutName] = useState("Workout");

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Fetch workout name and auto-send greeting on mount
  useEffect(() => {
    fetch("/api/current-workout")
      .then((r) => r.json())
      .then((data) => { if (data.name) setWorkoutName(data.name); })
      .catch(() => {});

    if (messages.length === 0) {
      sendMessage({ text: "Let's go" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isStreaming = status === "streaming" || status === "submitted";

  return (
    <div className="flex h-[100dvh] flex-col">
      <WorkoutHeader workoutName={workoutName} />
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.filter(m => m.role !== "system").map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-zinc-800 px-4 py-2.5 text-sm text-zinc-400">...</div>
          </div>
        )}
      </div>
      <ChatInput onSend={(text) => sendMessage({ text })} disabled={isStreaming} />
    </div>
  );
}
