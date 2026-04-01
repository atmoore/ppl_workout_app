import Link from "next/link";
import { getWeekWorkouts } from "@/db/queries";
import { TodayView } from "@/components/today-view";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getWeekWorkouts();

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <h1 className="text-xl font-semibold text-zinc-200">No Program Selected</h1>
        <p className="text-zinc-500 text-sm text-center">
          Choose a program to get started with your training.
        </p>
        <Link href="/programs" className="text-sm font-medium text-zinc-50 underline underline-offset-4">
          Browse Programs
        </Link>
      </div>
    );
  }

  const { program, phase, weekNumber, workouts, currentDayNumber } = data;

  return (
    <TodayView
      programName={program.name}
      phaseName={phase.name ?? `Phase ${phase.phaseNumber}`}
      weekNumber={weekNumber}
      workouts={workouts.map(w => ({
        id: w.id,
        dayNumber: w.dayNumber,
        name: w.name,
        type: w.type,
        exercises: w.exercises.map(e => ({
          name: e.name,
          workingSets: e.workingSets,
          reps: e.reps,
          rpe: e.rpe,
        })),
      }))}
      currentDayNumber={currentDayNumber}
    />
  );
}
