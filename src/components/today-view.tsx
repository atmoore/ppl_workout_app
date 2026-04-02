"use client";

import { useState } from "react";
import Link from "next/link";
import { WeekPills } from "./week-pills";
import { WorkoutPreview } from "./workout-preview";


interface Exercise {
  name: string;
  workingSets: number | null;
  reps: string | null;
  rpe: string | null;
}

interface Workout {
  id: number;
  dayNumber: number;
  name: string | null;
  type: string | null;
  exercises: Exercise[];
}

interface TodaySession {
  status: string;
  durationMinutes: number | null;
}

interface TodayViewProps {
  programName: string;
  phaseName: string;
  weekNumber: number;
  workouts: Workout[];
  currentDayNumber: number;
  todaySession: TodaySession | null;
  programComplete?: boolean;
}

export function TodayView({ programName, phaseName, weekNumber, workouts, currentDayNumber, todaySession, programComplete }: TodayViewProps) {
  const [selectedDay, setSelectedDay] = useState(currentDayNumber);

  const days = workouts.map(w => ({
    dayNumber: w.dayNumber,
    name: w.name ?? "Workout",
    type: w.type ?? "full",
  }));

  const selectedWorkout = workouts.find(w => w.dayNumber === selectedDay);
  const isCurrentDay = selectedDay === currentDayNumber;
  const isCompleted = isCurrentDay && todaySession?.status === "completed";
  const isActive = isCurrentDay && todaySession?.status === "active";

  const nextWorkout = workouts.find(w => w.dayNumber === currentDayNumber + 1);

  if (programComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4 pt-6">
        <span className="text-4xl">🎉</span>
        <h2 className="text-xl font-bold text-zinc-50">Program Complete!</h2>
        <p className="text-sm text-zinc-400 text-center">
          You finished {programName}. Time to pick your next program.
        </p>
        <Link
          href="/programs"
          className="rounded-xl bg-zinc-50 px-6 py-3 text-base font-semibold text-zinc-950 active:bg-zinc-300"
        >
          Browse Programs
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      {/* Program header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">{programName}</h1>
          <p className="text-sm text-zinc-400">{phaseName} · Week {weekNumber}</p>
        </div>
        <Link href="/programs" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          Change
        </Link>
      </div>

      {/* Week pills */}
      <WeekPills
        days={days}
        currentDay={currentDayNumber}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
      />

      {/* Selected workout */}
      {selectedWorkout && (
        <>
          {isCompleted ? (
            <div className="flex flex-col gap-3">
              {/* Completion card */}
              <div className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-5 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-green-400 text-lg font-bold">✓</span>
                  <span className="text-zinc-50 font-semibold text-base">Workout Complete</span>
                </div>
                <p className="text-sm text-zinc-400 pl-7">
                  {selectedWorkout.name ?? "Workout"}
                  {todaySession?.durationMinutes ? ` · ${todaySession.durationMinutes} min` : ""}
                </p>
              </div>

              {/* Next up */}
              {nextWorkout && (
                <div className="flex flex-col gap-1 px-1">
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Next up</p>
                  <p className="text-sm text-zinc-300">
                    Day {nextWorkout.dayNumber} · {nextWorkout.name ?? "Workout"}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              <WorkoutPreview
                name={selectedWorkout.name ?? "Workout"}
                type={selectedWorkout.type ?? "full"}
                exercises={selectedWorkout.exercises}
                isFuture={selectedDay > currentDayNumber}
              />
              {isCurrentDay && (
                <Link
                  href="/chat"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-50 px-4 py-3.5 text-base font-semibold text-zinc-950 transition-colors active:bg-zinc-300 active:scale-[0.98]"
                >
                  {isActive ? "Resume Workout" : "Start Workout"}
                </Link>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
