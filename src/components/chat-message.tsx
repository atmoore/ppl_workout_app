"use client";

import { cn } from "@/lib/utils";
import type { UIMessage } from "ai";
import { MessageResponse } from "@/components/ai-elements/message";

export function ChatMessage({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
          isUser
            ? "bg-zinc-100 text-zinc-900"
            : "bg-zinc-800 text-zinc-100"
        )}
      >
        {message.parts.map((part, i) => {
          if (part.type === "text") {
            return isUser ? (
              <span key={i} className="whitespace-pre-wrap">
                {part.text}
              </span>
            ) : (
              <MessageResponse key={i}>{part.text}</MessageResponse>
            );
          }
          // v6 tool parts: state is "output-available", data is in part.output
          if (part.type === "tool-logSets" && part.state === "output-available") {
            const result = part.output as {
              exerciseName: string;
              weight: number;
              sets: Array<{ set: number; reps: number }>;
            };
            return (
              <div
                key={i}
                className="my-1 rounded-lg bg-zinc-900 border border-zinc-700 p-2.5 font-mono text-xs"
              >
                <div className="text-zinc-400 mb-1">Logged</div>
                <div className="text-zinc-100">
                  {result.exerciseName}: {result.weight} lbs ×{" "}
                  {result.sets.map((s) => s.reps).join(", ")}
                </div>
              </div>
            );
          }
          if (part.type === "tool-endWorkout" && part.state === "output-available") {
            const result = part.output as {
              completed: boolean;
              duration: number;
              totalSets: number;
              exercisesLogged: number;
            };
            return (
              <div
                key={i}
                className="my-1 rounded-lg bg-green-950 border border-green-800 p-2.5 text-xs"
              >
                <div className="text-green-400 font-medium mb-1">
                  Workout Complete
                </div>
                <div className="text-green-200 font-mono">
                  {result.duration} min · {result.exercisesLogged} exercises ·{" "}
                  {result.totalSets} sets
                </div>
              </div>
            );
          }
          if (part.type === "tool-calculatePlates" && part.state === "output-available") {
            const result = part.output as {
              targetWeight?: number;
              barWeight?: number;
              perSide?: Array<{ plate: number; count: number }>;
              error?: string;
              note?: string;
            };
            if (result.error) {
              return (
                <div key={i} className="my-1 rounded-lg bg-red-950 border border-red-800 p-2.5 text-xs text-red-200">
                  {result.error}
                </div>
              );
            }
            return (
              <div key={i} className="my-1 rounded-lg bg-zinc-900 border border-zinc-700 p-2.5 font-mono text-xs">
                <div className="text-zinc-400 mb-1">{result.targetWeight} lbs — each side:</div>
                <div className="text-zinc-100">
                  {result.perSide?.map((p, j) => (
                    <span key={j}>{p.count}×{p.plate} </span>
                  ))}
                </div>
                {result.note && <div className="text-amber-400 mt-1 text-xs">{result.note}</div>}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
