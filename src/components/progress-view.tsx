"use client";

import { useState, useEffect } from "react";
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

interface WeeklyInsights {
  workouts: number;
  totalSets: number;
  totalVolume: number;
  totalMinutes: number;
  uniqueExercises: number;
}

interface ProgressViewProps {
  history: HistoryItem[];
  maxes: MaxItem[];
  topExercises: string[];
  weeklyInsights: WeeklyInsights;
}

export function ProgressView({ history, maxes, topExercises, weeklyInsights }: ProgressViewProps) {
  const [tab, setTab] = useState<"history" | "maxes" | "charts">("history");

  return (
    <div className="flex flex-col gap-4">
      {/* Weekly Insights Card */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">This Week</p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <span className="font-mono text-lg text-zinc-100">{weeklyInsights.workouts}</span>
            <p className="text-xs text-zinc-500">workouts</p>
          </div>
          <div>
            <span className="font-mono text-lg text-zinc-100">{weeklyInsights.totalSets}</span>
            <p className="text-xs text-zinc-500">sets</p>
          </div>
          <div>
            <span className="font-mono text-lg text-zinc-100">{weeklyInsights.totalMinutes}</span>
            <p className="text-xs text-zinc-500">minutes</p>
          </div>
        </div>
        {weeklyInsights.totalVolume > 0 && (
          <p className="text-xs text-zinc-500 text-center mt-2">
            {Math.round(weeklyInsights.totalVolume).toLocaleString()} lbs total volume · {weeklyInsights.uniqueExercises} exercises
          </p>
        )}
      </div>

      {/* Tab pills + export */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          {(["history", "maxes", "charts"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-lg px-5 py-2.5 min-h-[44px] flex items-center justify-center text-sm font-medium transition-colors",
                tab === t ? "bg-zinc-100 text-zinc-900" : "bg-zinc-800 text-zinc-400"
              )}
            >
              {t === "history" ? "History" : t === "maxes" ? "PRs" : "Charts"}
            </button>
          ))}
        </div>
        <a
          href="/api/export"
          download
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 min-h-[44px] flex items-center text-sm text-zinc-300 active:bg-zinc-700 transition-colors shrink-0"
        >
          Export CSV
        </a>
      </div>

      {/* History Tab */}
      {tab === "history" && (
        <div className="flex flex-col gap-2">
          {history.length === 0 ? (
            <p className="text-sm text-zinc-500 py-8 text-center">No completed workouts yet.</p>
          ) : (
            history.map((h) => (
              <div key={h.id} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-zinc-200">{h.workoutName}</span>
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

      {/* PRs Tab */}
      {tab === "maxes" && (
        <div className="flex flex-col gap-2">
          {maxes.length === 0 ? (
            <p className="text-sm text-zinc-500 py-8 text-center">No PRs recorded yet.</p>
          ) : (
            maxes.map((m, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
                <span className="text-sm text-zinc-200">{m.exerciseName}</span>
                <span className="font-mono text-sm text-zinc-100">{m.weight} lbs</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Charts Tab */}
      {tab === "charts" && (
        <div className="flex flex-col gap-3">
          {topExercises.length === 0 ? (
            <p className="text-sm text-zinc-500 py-8 text-center">Log some workouts to see charts.</p>
          ) : (
            topExercises.map((name) => (
              <ExerciseChart key={name} exerciseName={name} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ExerciseChart({ exerciseName }: { exerciseName: string }) {
  const [data, setData] = useState<Array<{ date: string; weight: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (expanded && data.length === 0) {
      fetch(`/api/exercise-progress?name=${encodeURIComponent(exerciseName)}`)
        .then((r) => r.json())
        .then((d) => setData(d.data ?? []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [expanded, exerciseName, data.length]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm text-zinc-200">{exerciseName}</span>
        <span className="text-xs text-zinc-500">{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-4">
          {loading ? (
            <p className="text-xs text-zinc-500">Loading...</p>
          ) : data.length < 2 ? (
            <p className="text-xs text-zinc-500">Need 2+ sessions to show chart.</p>
          ) : (
            <MiniChart data={data} />
          )}
        </div>
      )}
    </div>
  );
}

function MiniChart({ data }: { data: Array<{ date: string; weight: number }> }) {
  const weights = data.map((d) => d.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;

  const width = 280;
  const height = 80;
  const padding = 4;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((d.weight - minW) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const polyline = points.join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-20">
        <polyline
          points={polyline}
          fill="none"
          stroke="#a1a1aa"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Dots on each data point */}
        {data.map((d, i) => {
          const x = padding + (i / (data.length - 1)) * (width - padding * 2);
          const y = height - padding - ((d.weight - minW) / range) * (height - padding * 2);
          return <circle key={i} cx={x} cy={y} r="3" fill="#f4f4f5" />;
        })}
      </svg>
      <div className="flex justify-between text-xs text-zinc-500 font-mono mt-1">
        <span>{formatDate(data[0].date)}</span>
        <span>{maxW} lbs</span>
        <span>{formatDate(data[data.length - 1].date)}</span>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
