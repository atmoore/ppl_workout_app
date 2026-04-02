import { getWeekWorkouts, getAllPrograms, cleanupAbandonedSessions } from "@/db/queries";
import { TodayView } from "@/components/today-view";
import { Onboarding } from "@/components/onboarding";

export const dynamic = "force-dynamic";

export default async function Home() {
  await cleanupAbandonedSessions();
  const data = await getWeekWorkouts();

  if (!data) {
    const programs = await getAllPrograms();
    return (
      <Onboarding
        programs={programs.map(p => ({
          id: p.id,
          name: p.name,
          frequency: p.frequency,
          description: p.description,
        }))}
      />
    );
  }

  const { program, phase, weekNumber, workouts, currentDayNumber, todaySession } = data;

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
      todaySession={todaySession ? {
        status: todaySession.status ?? "active",
        durationMinutes: todaySession.durationMinutes,
      } : null}
    />
  );
}
