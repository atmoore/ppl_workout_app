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
      // Resuming — account for paused duration
      setPausedTime((prev) => prev + Math.floor((Date.now() - startTime) / 1000) - elapsed - prev);
    }
    setPaused(!paused);
  };

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-sm px-4 py-3">
      <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200">
        <ArrowLeft className="h-4 w-4" />
      </Link>
      <h1 className="text-sm font-medium text-zinc-200">{workoutName}</h1>
      <div className="flex items-center gap-2">
        <span className={`font-mono text-sm ${paused ? "text-amber-400" : "text-zinc-400"}`}>
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
        <button onClick={togglePause} className="text-zinc-400 hover:text-zinc-200">
          {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
