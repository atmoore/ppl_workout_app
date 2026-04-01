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

interface TodayViewProps {
  programName: string;
  phaseName: string;
  weekNumber: number;
  workouts: Workout[];
  currentDayNumber: number;
}

export function TodayView({ programName, phaseName, weekNumber, workouts, currentDayNumber }: TodayViewProps) {
  const [selectedDay, setSelectedDay] = useState(currentDayNumber);

  const days = workouts.map(w => ({
    dayNumber: w.dayNumber,
    name: w.name ?? "Workout",
    type: w.type ?? "full",
  }));

  const selectedWorkout = workouts.find(w => w.dayNumber === selectedDay);
  const isCurrentDay = selectedDay === currentDayNumber;

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      {/* Program header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">{programName}</h1>
        <p className="text-sm text-zinc-400">{phaseName} · Week {weekNumber}</p>
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
              Start Workout
            </Link>
          )}
        </>
      )}
    </div>
  );
}
