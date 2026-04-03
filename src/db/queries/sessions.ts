import { db } from "../index";
import { workoutSessions, setLogs, workoutTemplates } from "../schema";
import { eq, desc, and, sql } from "drizzle-orm";

export async function getTodaySession() {
  const today = new Date().toISOString().split("T")[0];
  const rows = await db
    .select()
    .from(workoutSessions)
    .where(eq(workoutSessions.date, today))
    .orderBy(desc(workoutSessions.id))
    .limit(1);
  return rows[0] || null;
}

export async function getActiveSession() {
  const rows = await db
    .select()
    .from(workoutSessions)
    .where(eq(workoutSessions.status, "active"))
    .limit(1);
  return rows[0] || null;
}

export async function getLastCompletedSession() {
  const rows = await db
    .select()
    .from(workoutSessions)
    .where(eq(workoutSessions.status, "completed"))
    .orderBy(desc(workoutSessions.completedAt))
    .limit(1);
  return rows[0] || null;
}

export async function cleanupAbandonedSessions() {
  const today = new Date().toISOString().split("T")[0];
  await db
    .update(workoutSessions)
    .set({ status: "skipped" })
    .where(
      and(
        eq(workoutSessions.status, "active"),
        sql`${workoutSessions.date} < ${today}`
      )
    );
}

export async function getWorkoutHistory(limit: number = 20) {
  const sessions = await db
    .select({
      id: workoutSessions.id,
      date: workoutSessions.date,
      durationMinutes: workoutSessions.durationMinutes,
      status: workoutSessions.status,
      workoutTemplateId: workoutSessions.workoutTemplateId,
    })
    .from(workoutSessions)
    .where(eq(workoutSessions.status, "completed"))
    .orderBy(desc(workoutSessions.date))
    .limit(limit);

  if (sessions.length === 0) return [];

  // Batch: get all workout template names
  const templateIds = [...new Set(sessions.map(s => s.workoutTemplateId).filter(Boolean))] as number[];
  const templates = templateIds.length > 0
    ? await db.select().from(workoutTemplates).where(sql`${workoutTemplates.id} IN (${sql.join(templateIds.map(id => sql`${id}`), sql`, `)})`)
    : [];
  const templateMap = new Map(templates.map(t => [t.id, t.name ?? "Workout"]));

  // Batch: get set counts and exercise counts per session
  const sessionIds = sessions.map(s => s.id);
  const setCounts = await db
    .select({
      sessionId: setLogs.sessionId,
      totalSets: sql<number>`count(*)`,
      exerciseCount: sql<number>`count(distinct ${setLogs.exerciseName})`,
    })
    .from(setLogs)
    .where(sql`${setLogs.sessionId} IN (${sql.join(sessionIds.map(id => sql`${id}`), sql`, `)})`)
    .groupBy(setLogs.sessionId);
  const setCountMap = new Map(setCounts.map(s => [s.sessionId, s]));

  return sessions.map(s => ({
    ...s,
    workoutName: (s.workoutTemplateId ? templateMap.get(s.workoutTemplateId) : null) ?? "Workout",
    totalSets: Number(setCountMap.get(s.id)?.totalSets) || 0,
    exerciseCount: Number(setCountMap.get(s.id)?.exerciseCount) || 0,
  }));
}
