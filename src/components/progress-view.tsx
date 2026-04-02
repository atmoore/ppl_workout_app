"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Calendar, Clock } from "lucide-react";

interface HistoryItem {
  id: number;
  date: string;
  workoutName: string;
  durationMinutes: number | null;
  totalSets: number;
  exerciseCount: number;
}

interface MaxItem {
  exerciseName: string;
  weight: string | null;
  updatedAt: string;
}

interface ProgressViewProps {
  history: HistoryItem[];
  maxes: MaxItem[];
}

export function ProgressView({ history, maxes }: ProgressViewProps) {
  const [tab, setTab] = useState<"history" | "maxes">("history");

  return (
    <div className="flex flex-col gap-4">
      {/* Tab pills */}
      <div className="flex gap-2">
        {(["history", "maxes"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              tab === t ? "bg-zinc-100 text-zinc-900" : "bg-zinc-800 text-zinc-400"
            )}
          >
            {t === "history" ? "History" : "PRs"}
          </button>
        ))}
      </div>

      {tab === "history" && (
        <div className="flex flex-col gap-2">
          {history.length === 0 ? (
            <p className="text-sm text-zinc-500 py-8 text-center">
              No completed workouts yet. Start your first workout!
            </p>
          ) : (
            history.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-zinc-200">
                    {h.workoutName}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(h.date)}
                    </span>
                    {h.durationMinutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {h.durationMinutes}m
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                  <span>{h.exerciseCount} ex</span>
                  <span>{h.totalSets} sets</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "maxes" && (
        <div className="flex flex-col gap-2">
          {maxes.length === 0 ? (
            <p className="text-sm text-zinc-500 py-8 text-center">
              No PRs recorded yet. Log your first workout!
            </p>
          ) : (
            maxes.map((m, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3"
              >
                <span className="text-sm text-zinc-200">{m.exerciseName}</span>
                <span className="font-mono text-sm text-zinc-100">
                  {m.weight} lbs
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
