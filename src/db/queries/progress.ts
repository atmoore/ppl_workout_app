import { db } from "../index";
import { exerciseMaxes, setLogs, workoutSessions } from "../schema";
import { eq, desc, and, sql } from "drizzle-orm";

export async function getExerciseMaxes() {
  return db.select().from(exerciseMaxes).orderBy(desc(exerciseMaxes.updatedAt));
}

export async function getExerciseProgressData(exerciseName: string) {
  const logs = await db
    .select({
      date: workoutSessions.date,
      weight: setLogs.weight,
      reps: setLogs.reps,
    })
    .from(setLogs)
    .innerJoin(workoutSessions, eq(setLogs.sessionId, workoutSessions.id))
    .where(eq(setLogs.exerciseName, exerciseName))
    .orderBy(workoutSessions.date);

  // Group by date, take max weight per date
  const byDate = new Map<string, number>();
  for (const log of logs) {
    const date = log.date ?? "";
    const weight = Number(log.weight) || 0;
    if (!byDate.has(date) || weight > byDate.get(date)!) {
      byDate.set(date, weight);
    }
  }

  return Array.from(byDate.entries()).map(([date, weight]) => ({ date, weight }));
}

export async function getTopExercises(limit: number = 8) {
  const result = await db
    .select({ exerciseName: setLogs.exerciseName })
    .from(setLogs)
    .groupBy(setLogs.exerciseName)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);

  return result.map(r => r.exerciseName).filter(Boolean) as string[];
}

export async function getWeeklyInsights() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const dateStr = sevenDaysAgo.toISOString().split("T")[0];

  const [result] = await db
    .select({
      workouts: sql<number>`count(distinct ${workoutSessions.id})`,
      totalSets: sql<number>`count(${setLogs.id})`,
      totalVolume: sql<number>`coalesce(sum(cast(${setLogs.weight} as numeric) * ${setLogs.reps}), 0)`,
      totalMinutes: sql<number>`coalesce(sum(distinct ${workoutSessions.durationMinutes}), 0)`,
      uniqueExercises: sql<number>`count(distinct ${setLogs.exerciseName})`,
    })
    .from(workoutSessions)
    .leftJoin(setLogs, eq(setLogs.sessionId, workoutSessions.id))
    .where(
      and(
        eq(workoutSessions.status, "completed"),
        sql`${workoutSessions.date} >= ${dateStr}`
      )
    );

  return {
    workouts: Number(result?.workouts) || 0,
    totalSets: Number(result?.totalSets) || 0,
    totalVolume: Number(result?.totalVolume) || 0,
    totalMinutes: Number(result?.totalMinutes) || 0,
    uniqueExercises: Number(result?.uniqueExercises) || 0,
  };
}

export async function getExerciseHistory(exerciseName: string, limit: number = 4) {
  const logs = await db
    .select({
      date: workoutSessions.date,
      weight: setLogs.weight,
      reps: setLogs.reps,
      setNumber: setLogs.setNumber,
      sessionId: setLogs.sessionId,
    })
    .from(setLogs)
    .innerJoin(workoutSessions, eq(setLogs.sessionId, workoutSessions.id))
    .where(eq(setLogs.exerciseName, exerciseName))
    .orderBy(desc(workoutSessions.date), setLogs.setNumber);

  const sessions = new Map<number, { date: string; sets: Array<{ weight: string | null; reps: number | null }> }>();
  for (const log of logs) {
    if (!sessions.has(log.sessionId)) {
      sessions.set(log.sessionId, { date: log.date || "", sets: [] });
    }
    sessions.get(log.sessionId)!.sets.push({ weight: log.weight, reps: log.reps });
  }
  return Array.from(sessions.values()).slice(0, limit);
}
