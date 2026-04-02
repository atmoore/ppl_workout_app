import { db } from "@/db";
import { workoutSessions, setLogs, workoutTemplates } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  // Get all completed sessions with their sets
  const sessions = await db
    .select()
    .from(workoutSessions)
    .where(eq(workoutSessions.status, "completed"))
    .orderBy(desc(workoutSessions.date));

  const rows: string[] = [
    "Date,Workout,Exercise,Set,Weight (lbs),Reps,RPE,Substituted For",
  ];

  for (const session of sessions) {
    let workoutName = "Workout";
    if (session.workoutTemplateId) {
      const [wt] = await db
        .select()
        .from(workoutTemplates)
        .where(eq(workoutTemplates.id, session.workoutTemplateId));
      if (wt) workoutName = wt.name ?? "Workout";
    }

    const sets = await db
      .select()
      .from(setLogs)
      .where(eq(setLogs.sessionId, session.id))
      .orderBy(setLogs.exerciseName, setLogs.setNumber);

    for (const set of sets) {
      const csvRow = [
        session.date ?? "",
        escapeCsv(workoutName),
        escapeCsv(set.exerciseName ?? ""),
        set.setNumber ?? "",
        set.weight ?? "",
        set.reps ?? "",
        set.rpe ?? "",
        escapeCsv(set.substitutedFor ?? ""),
      ].join(",");
      rows.push(csvRow);
    }
  }

  const csv = rows.join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="workout-history-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
