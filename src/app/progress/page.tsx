import { getWorkoutHistory, getExerciseMaxes, getTopExercises, getWeeklyInsights } from "@/db/queries";
import { ProgressView } from "@/components/progress-view";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const [history, maxes, topExercises, weeklyInsights] = await Promise.all([
    getWorkoutHistory(20),
    getExerciseMaxes(),
    getTopExercises(8),
    getWeeklyInsights(),
  ]);

  return (
    <div className="flex flex-col gap-6 px-4 pt-6 pb-8">
      <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">Progress</h1>
      <ProgressView
        history={history.map(h => ({
          id: h.id,
          date: h.date ?? "",
          workoutName: h.workoutName,
          durationMinutes: h.durationMinutes,
          totalSets: h.totalSets,
          exerciseCount: h.exerciseCount,
        }))}
        maxes={maxes.map(m => ({
          exerciseName: m.exerciseName,
          weight: m.weight,
          updatedAt: m.updatedAt?.toISOString() ?? "",
        }))}
        topExercises={topExercises}
        weeklyInsights={weeklyInsights}
      />
    </div>
  );
}
