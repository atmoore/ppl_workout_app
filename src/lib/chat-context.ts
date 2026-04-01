import { getCurrentWorkout, getExerciseHistory } from "@/db/queries";

export async function buildSystemPrompt() {
  const data = await getCurrentWorkout();
  if (!data) return "No workout is currently scheduled. Tell the user to select a program first.";

  const { program, phase, week, workout, exercises } = data;

  const exerciseList = exercises
    .map((ex, i) => {
      const subs = ex.substitutions.map((s) => s.name).join(", ");
      return `${i + 1}. ${ex.name} — ${ex.workingSets}×${ex.reps || "?"} @ RPE ${ex.rpe || "?"} (Rest: ${ex.rest || "?"})\n   Subs: ${subs || "none"}\n   Notes: ${ex.notes || "none"}`;
    })
    .join("\n");

  const historyLines: string[] = [];
  for (const ex of exercises) {
    const history = await getExerciseHistory(ex.name, 4);
    if (history.length > 0) {
      const sessions = history
        .map((h) => `${h.date}: ${h.sets.map((s) => `${s.weight}×${s.reps}`).join(", ")}`)
        .join(" | ");
      historyLines.push(`${ex.name}: ${sessions}`);
    }
  }

  return `You are a workout coaching assistant for Austin. You parse workout input, log sets, and give coaching feedback.

CURRENT PROGRAM: ${program.name}
PHASE: ${phase.name ?? "Phase " + phase.phaseNumber} | WEEK: ${week.weekNumber}
WORKOUT: ${workout.name} (${workout.type})

TODAY'S EXERCISES:
${exerciseList}

${historyLines.length > 0 ? "RECENT HISTORY (last 4 sessions per exercise):\n" + historyLines.join("\n") : "No previous history yet."}

RULES:
- When the user types something like "bench 225 5 5 4", parse it as: exercise match → weight → reps per set. Call the logSets tool to record it.
- Match shorthand to today's exercises (e.g., "bench" → "Bench Press", "arnold" → "Standing Dumbbell Arnold Press")
- After logging via tool, compare against prescribed targets (rep range, RPE) and previous sessions
- If weight/reps went up from last session, acknowledge it. If down, suggest staying at same weight.
- When user says equipment is taken/unavailable, suggest the substitution options listed above
- When user says "only have X minutes", trim workout: keep compounds, reduce/cut isolation
- When user says "done" or "finished", call the endWorkout tool, then summarize: duration, exercises completed, trends
- Be concise. Speak like a training partner, not a textbook.
- Always use the logSets tool to record data before giving feedback.
- Always use the endWorkout tool when the user indicates they're done.`;
}
