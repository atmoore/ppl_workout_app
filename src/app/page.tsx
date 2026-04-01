import Link from "next/link";
import { getCurrentWorkout } from "@/db/queries";
import { WorkoutCard } from "@/components/workout-card";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getCurrentWorkout();

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <h1 className="text-xl font-semibold text-zinc-200">No Program Selected</h1>
        <p className="text-zinc-500 text-sm text-center">
          Choose a program to get started with your training.
        </p>
        <Link
          href="/programs"
          className="text-sm font-medium text-zinc-50 underline underline-offset-4"
        >
          Browse Programs
        </Link>
      </div>
    );
  }

  const { program, phase, week, workout, exercises, totalDaysInWeek, profile } = data;

  return (
    <div className="flex flex-col gap-4 px-4 pt-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">
          {program.name}
        </h1>
        <p className="text-sm text-zinc-400">
          {phase.name ?? `Phase ${phase.phaseNumber}`} · Week {week.weekNumber}
        </p>
      </div>
      <WorkoutCard
        workout={workout}
        exercises={exercises}
        dayNumber={profile.currentDayNumber ?? 1}
        totalDays={totalDaysInWeek}
      />
    </div>
  );
}
