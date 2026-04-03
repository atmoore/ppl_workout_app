import { z } from "zod";
import { db } from "@/db";
import { setLogs, workoutSessions, exerciseMaxes } from "@/db/schema";
import { getActiveSession, type CurrentWorkoutData } from "@/db/queries";
import { advanceDay } from "@/db/queries";
import { eq, and, desc, sql } from "drizzle-orm";

// ─── Session management ─────────────────────────────────────────────────────

export async function getOrCreateSession(workoutData: CurrentWorkoutData | null) {
  const today = new Date().toISOString().split("T")[0];
  const existing = await db
    .select()
    .from(workoutSessions)
    .where(and(eq(workoutSessions.status, "active"), eq(workoutSessions.date, today)))
    .limit(1);
  if (existing[0]) return existing[0];

  // Mark any stale active sessions from previous days as skipped
  await db
    .update(workoutSessions)
    .set({ status: "skipped" })
    .where(and(eq(workoutSessions.status, "active"), sql`${workoutSessions.date} < ${today}`));

  const [session] = await db.insert(workoutSessions).values({
    workoutTemplateId: workoutData?.workout.id || null,
    date: today,
    startedAt: new Date(),
    status: "active",
  }).returning();
  return session;
}

// ─── Tool definitions ────────────────────────────────────────────────────────

export function createChatTools(workoutData: CurrentWorkoutData | null) {
  return {
    logSets: {
      description: "Log one or more sets for an exercise. Call this whenever the user reports what they did.",
      inputSchema: z.object({
        exerciseName: z.string().describe("The full exercise name from today's workout"),
        weight: z.number().describe("Weight used (lbs)"),
        reps: z.array(z.number()).describe("Reps completed per set, e.g. [5, 5, 4]"),
        substitutedFor: z.string().optional().describe("If this was a substitution, the original exercise name"),
      }),
      execute: async ({ exerciseName, weight, reps, substitutedFor }: { exerciseName: string; weight: number; reps: number[]; substitutedFor?: string }) => {
        const session = await getOrCreateSession(workoutData);
        const existing = await db
          .select({ maxSet: sql<number>`coalesce(max(${setLogs.setNumber}), 0)` })
          .from(setLogs)
          .where(and(eq(setLogs.sessionId, session.id), eq(setLogs.exerciseName, exerciseName)));
        const startSet = (existing[0]?.maxSet ?? 0) + 1;
        await db.insert(setLogs).values(
          reps.map((r: number, i: number) => ({
            sessionId: session.id,
            exerciseName,
            setNumber: startSet + i,
            setType: "working" as const,
            weight: String(weight),
            reps: r,
            substitutedFor: substitutedFor || null,
          }))
        );
        // Update exercise max
        const [existingMax] = await db.select().from(exerciseMaxes).where(eq(exerciseMaxes.exerciseName, exerciseName)).limit(1);
        if (existingMax) {
          if (Number(existingMax.weight) < weight) {
            await db.update(exerciseMaxes).set({ weight: String(weight), updatedAt: new Date() }).where(eq(exerciseMaxes.id, existingMax.id));
          }
        } else {
          const guard = await db.select({ id: exerciseMaxes.id }).from(exerciseMaxes).where(eq(exerciseMaxes.exerciseName, exerciseName)).limit(1);
          if (guard.length === 0) {
            await db.insert(exerciseMaxes).values({ exerciseName, weight: String(weight) });
          }
        }
        return { logged: true, exerciseName, weight, sets: reps.map((r: number, idx: number) => ({ set: idx + 1, reps: r })) };
      },
    },

    calculatePlates: {
      description: "Calculate what plates to put on each side of a barbell for a given weight. Call this when the user asks about plates, loading, or what to put on the bar.",
      inputSchema: z.object({
        targetWeight: z.number().describe("The total target weight in lbs"),
        barWeight: z.number().default(45).describe("Bar weight in lbs, default 45"),
      }),
      execute: async ({ targetWeight, barWeight }: { targetWeight: number; barWeight: number }) => {
        const plates = [45, 35, 25, 10, 5, 2.5];
        let remaining = (targetWeight - barWeight) / 2;

        if (remaining < 0) {
          return { error: `Target weight ${targetWeight} lbs is less than the bar (${barWeight} lbs)` };
        }

        const perSide: { plate: number; count: number }[] = [];
        for (const plate of plates) {
          if (remaining >= plate) {
            const count = Math.floor(remaining / plate);
            perSide.push({ plate, count });
            remaining -= plate * count;
          }
        }

        if (remaining > 0) {
          return { targetWeight, barWeight, perSide, note: `Cannot make exact weight. ${remaining * 2} lbs remaining.` };
        }

        return { targetWeight, barWeight, perSide };
      },
    },

    endWorkout: {
      description: "End the current workout session. Call when user says 'done', 'finished', or 'that's it'.",
      inputSchema: z.object({
        notes: z.string().optional().describe("Any summary notes"),
      }),
      execute: async ({ notes }: { notes?: string }) => {
        const session = await getActiveSession();
        if (!session) return { completed: false, error: "No active session" };
        const startedAt = session.startedAt ? new Date(session.startedAt) : new Date();
        const duration = Math.round((Date.now() - startedAt.getTime()) / 60000);
        await db.update(workoutSessions).set({
          status: "completed", completedAt: new Date(), durationMinutes: duration, notes: notes || null,
        }).where(eq(workoutSessions.id, session.id));
        await advanceDay();
        const sets = await db.select().from(setLogs).where(eq(setLogs.sessionId, session.id));
        const exercises = new Set(sets.map((s) => s.exerciseName));
        return { completed: true, duration, totalSets: sets.length, exercisesLogged: exercises.size };
      },
    },

    editLastLog: {
      description: "Edit or delete the most recently logged sets for an exercise. Call when user says they made a mistake, logged wrong weight/reps, or wants to undo the last entry.",
      inputSchema: z.object({
        exerciseName: z.string().describe("The exercise to correct"),
        action: z.enum(["edit", "delete"]).describe("Whether to edit or delete"),
        newWeight: z.number().optional().describe("New weight if editing"),
        newReps: z.array(z.number()).optional().describe("New reps if editing"),
      }),
      execute: async ({ exerciseName, action, newWeight, newReps }: { exerciseName: string; action: "edit" | "delete"; newWeight?: number; newReps?: number[] }) => {
        const session = await getActiveSession();
        if (!session) return { success: false, error: "No active session" };

        const allSets = await db
          .select()
          .from(setLogs)
          .where(and(eq(setLogs.sessionId, session.id), eq(setLogs.exerciseName, exerciseName)))
          .orderBy(desc(setLogs.id));

        if (allSets.length === 0) {
          return { success: false, error: `No logged sets found for ${exerciseName}` };
        }

        const lastWeight = allSets[0].weight;
        const lastBatch = allSets.filter(s => s.weight === lastWeight);
        const batchIds = lastBatch.map(s => s.id);

        if (action === "delete") {
          await db.delete(setLogs).where(sql`${setLogs.id} IN (${sql.join(batchIds.map(id => sql`${id}`), sql`, `)})`);
          return { success: true, action: "deleted", exerciseName, setsRemoved: lastBatch.length };
        }

        if (action === "edit" && newWeight !== undefined && newReps) {
          const startSetNumber = Math.min(...lastBatch.map(s => s.setNumber ?? 1));
          await db.delete(setLogs).where(sql`${setLogs.id} IN (${sql.join(batchIds.map(id => sql`${id}`), sql`, `)})`);
          await db.insert(setLogs).values(
            newReps.map((r: number, i: number) => ({
              sessionId: session.id,
              exerciseName,
              setNumber: startSetNumber + i,
              setType: "working" as const,
              weight: String(newWeight),
              reps: r,
            }))
          );
          return { success: true, action: "edited", exerciseName, newWeight, newReps };
        }

        return { success: false, error: "Missing weight or reps for edit" };
      },
    },
  };
}
