import { db } from "@/db";
import { workoutSessions, setLogs, workoutTemplates } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  // Single join query: sessions + templates + set logs
  const data = await db
    .select({
      date: workoutSessions.date,
      workoutName: workoutTemplates.name,
      exerciseName: setLogs.exerciseName,
      setNumber: setLogs.setNumber,
      weight: setLogs.weight,
      reps: setLogs.reps,
      rpe: setLogs.rpe,
      substitutedFor: setLogs.substitutedFor,
    })
    .from(workoutSessions)
    .innerJoin(setLogs, eq(setLogs.sessionId, workoutSessions.id))
    .leftJoin(workoutTemplates, eq(workoutTemplates.id, workoutSessions.workoutTemplateId))
    .where(eq(workoutSessions.status, "completed"))
    .orderBy(desc(workoutSessions.date), setLogs.exerciseName, setLogs.setNumber);

  const rows: string[] = [
    "Date,Workout,Exercise,Set,Weight (lbs),Reps,RPE,Substituted For",
  ];

  for (const row of data) {
    const csvRow = [
      row.date ?? "",
      escapeCsv(row.workoutName ?? "Workout"),
      escapeCsv(row.exerciseName ?? ""),
      row.setNumber ?? "",
      row.weight ?? "",
      row.reps ?? "",
      row.rpe ?? "",
      escapeCsv(row.substitutedFor ?? ""),
    ].join(",");
    rows.push(csvRow);
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
