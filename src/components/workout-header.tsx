"use client";
import { useState, useEffect } from "react";
import { Pause, Play, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function WorkoutHeader({ workoutName }: { workoutName: string }) {
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [startTime] = useState(() => Date.now());
  const [pausedTime, setPausedTime] = useState(0);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000) - pausedTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, paused, pausedTime]);

  const togglePause = () => {
    if (paused) {
      setPausedTime(
        (prev) =>
          prev + Math.floor((Date.now() - startTime) / 1000) - elapsed - prev
      );
    }
    setPaused(!paused);
  };

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-sm px-4 py-3 safe-top">
      <Link
        href="/"
        className="flex items-center justify-center h-11 w-11 -ml-1 rounded-lg text-zinc-400 active:bg-zinc-800"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>
      <h1 className="text-sm font-medium text-zinc-200 truncate px-2">
        {workoutName}
      </h1>
      <div className="flex items-center gap-3">
        <span
          className={`font-mono text-sm tabular-nums ${paused ? "text-amber-400" : "text-zinc-400"}`}
        >
          {String(minutes).padStart(2, "0")}:
          {String(seconds).padStart(2, "0")}
        </span>
        <button
          onClick={togglePause}
          className="flex items-center justify-center h-11 w-11 -mr-1 rounded-lg text-zinc-400 active:bg-zinc-800"
        >
          {paused ? (
            <Play className="h-5 w-5" />
          ) : (
            <Pause className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}
