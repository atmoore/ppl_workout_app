import { convertToModelMessages, streamText, UIMessage } from "ai";
import { z } from "zod";
import { buildSystemPrompt } from "@/lib/chat-context";
import { db } from "@/db";
import { setLogs, workoutSessions, exerciseMaxes } from "@/db/schema";
import { getCurrentWorkout, advanceDay } from "@/db/queries";
import { eq } from "drizzle-orm";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const systemPrompt = await buildSystemPrompt();
  const workoutData = await getCurrentWorkout();

  const result = streamText({
    model: "anthropic/claude-sonnet-4.6",
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools: {
      logSets: {
        description: "Log one or more sets for an exercise. Call this whenever the user reports what they did.",
        inputSchema: z.object({
          exerciseName: z.string().describe("The full exercise name from today's workout"),
          weight: z.number().describe("Weight used (lbs)"),
          reps: z.array(z.number()).describe("Reps completed per set, e.g. [5, 5, 4]"),
          substitutedFor: z.string().optional().describe("If this was a substitution, the original exercise name"),
        }),
        execute: async ({ exerciseName, weight, reps, substitutedFor }) => {
          const session = await getOrCreateSession(workoutData);
          for (let i = 0; i < reps.length; i++) {
            await db.insert(setLogs).values({
              sessionId: session.id,
              exerciseName,
              setNumber: i + 1,
              setType: "working",
              weight: String(weight),
              reps: reps[i],
              substitutedFor: substitutedFor || null,
            });
          }
          // Update exercise max
          const existingMax = await db.select().from(exerciseMaxes).where(eq(exerciseMaxes.exerciseName, exerciseName)).limit(1);
          if (!existingMax[0] || Number(existingMax[0].weight) < weight) {
            if (existingMax[0]) {
              await db.update(exerciseMaxes).set({ weight: String(weight), updatedAt: new Date() }).where(eq(exerciseMaxes.id, existingMax[0].id));
            } else {
              await db.insert(exerciseMaxes).values({ exerciseName, weight: String(weight) });
            }
          }
          return { logged: true, exerciseName, weight, sets: reps.map((r: number, idx: number) => ({ set: idx + 1, reps: r })) };
        },
      },
      endWorkout: {
        description: "End the current workout session. Call when user says 'done', 'finished', or 'that's it'.",
        inputSchema: z.object({
          notes: z.string().optional().describe("Any summary notes"),
        }),
        execute: async ({ notes }) => {
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
    },
  });

  return result.toUIMessageStreamResponse({ originalMessages: messages });
}

async function getOrCreateSession(workoutData: Awaited<ReturnType<typeof getCurrentWorkout>>) {
  const existing = await db.select().from(workoutSessions).where(eq(workoutSessions.status, "active")).limit(1);
  if (existing[0]) return existing[0];
  const [session] = await db.insert(workoutSessions).values({
    workoutTemplateId: workoutData?.workout.id || null,
    date: new Date().toISOString().split("T")[0],
    startedAt: new Date(),
    status: "active",
  }).returning();
  return session;
}

async function getActiveSession() {
  const rows = await db.select().from(workoutSessions).where(eq(workoutSessions.status, "active")).limit(1);
  return rows[0] || null;
}
