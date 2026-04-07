"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { WorkoutHeader } from "@/components/workout-header";

export default function ChatPage() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const [workoutName, setWorkoutName] = useState("Workout");
  const [workoutEnded, setWorkoutEnded] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "instant" });
  }, [messages]);

  // Detect workout end from tool results in messages
  useEffect(() => {
    for (const msg of messages) {
      for (const part of msg.parts) {
        if (
          part.type === "tool-endWorkout" &&
          part.state === "output-available"
        ) {
          const result = part.output as { completed?: boolean };
          if (result?.completed) {
            setWorkoutEnded(true);
          }
        }
      }
    }
  }, [messages]);

  // Fetch workout name and auto-send greeting on mount
  useEffect(() => {
    fetch("/api/current-workout")
      .then((r) => r.json())
      .then((data) => {
        if (data.name) setWorkoutName(data.name);

        if (messages.length === 0) {
          if (data.hasActiveSession && data.activeSession?.setsLogged > 0) {
            // Resume existing session
            const names = data.activeSession.exerciseNames.slice(0, 3).join(", ");
            sendMessage({
              text: `I'm back. I already logged ${data.activeSession.exercisesLogged} exercises (${names}). What's next?`,
            });
          } else {
            sendMessage({ text: "Let's go" });
          }
        }
      })
      .catch(() => {
        if (messages.length === 0) {
          sendMessage({ text: "Let's go" });
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isStreaming = status === "streaming" || status === "submitted";

  return (
    <div className="flex h-[100dvh] flex-col">
      <WorkoutHeader workoutName={workoutName} />
      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 space-y-3">
        {messages
          .filter((m) => m.role !== "system")
          .map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-zinc-800 px-4 py-2.5 text-sm text-zinc-400">
              ...
            </div>
          </div>
        )}
      </div>

      {/* Post-workout: show "Back to Today" instead of input */}
      {workoutEnded ? (
        <div className="border-t border-zinc-800 bg-zinc-950 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
          <Link
            href="/"
            className="block w-full rounded-xl bg-green-600 px-4 py-3.5 text-center text-base font-semibold text-white active:bg-green-700 active:scale-[0.98]"
          >
            Back to Today
          </Link>
        </div>
      ) : (
        <ChatInput
          onSend={(text) => sendMessage({ text })}
          disabled={isStreaming}
        />
      )}
    </div>
  );
}
