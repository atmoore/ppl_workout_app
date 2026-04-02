import { getCurrentWorkout } from "@/db/queries";
import { db } from "@/db";
import { workoutSessions, setLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getCurrentWorkout();

  // Check for active session
  const activeSessions = await db
    .select()
    .from(workoutSessions)
    .where(eq(workoutSessions.status, "active"))
    .limit(1);

  let activeSessionInfo = null;
  if (activeSessions[0]) {
    const sets = await db
      .select()
      .from(setLogs)
      .where(eq(setLogs.sessionId, activeSessions[0].id));

    const exerciseNames = [...new Set(sets.map(s => s.exerciseName))];
    activeSessionInfo = {
      id: activeSessions[0].id,
      setsLogged: sets.length,
      exercisesLogged: exerciseNames.length,
      exerciseNames,
    };
  }

  return Response.json({
    name: data?.workout.name ?? "Workout",
    hasActiveSession: !!activeSessionInfo,
    activeSession: activeSessionInfo,
  });
}
