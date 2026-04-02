import { getCurrentWorkout, getExerciseHistory, getEssentialsWorkout } from "@/db/queries";

function classifyExercise(name: string): "primary" | "secondary" | "tertiary" {
  const lower = name.toLowerCase();

  // Primary: main barbell compounds
  const primaryPatterns = [
    "bench press", "squat", "deadlift", "overhead press", "military press",
    "barbell row", "pendlay row", "pull-up", "chin-up",
  ];
  if (
    primaryPatterns.some(p => lower.includes(p)) &&
    !lower.includes("pause") &&
    !lower.includes("close grip") &&
    !lower.includes("speed")
  ) {
    return "primary";
  }

  // Secondary: supporting compounds
  const secondaryPatterns = [
    "incline press", "dip", "lunge", "rdl", "romanian deadlift", "hip thrust",
    "pulldown", "row", "front squat", "hack squat", "leg press",
    "pin press", "larsen press", "pause bench", "pause squat",
    "arnold press", "close grip bench", "weighted dip", "speed bench",
  ];
  if (secondaryPatterns.some(p => lower.includes(p))) {
    return "secondary";
  }

  // Everything else is tertiary
  return "tertiary";
}

export async function buildSystemPrompt() {
  const data = await getCurrentWorkout();
  if (!data) return "No workout is currently scheduled. Tell the user to select a program first.";

  const { program, phase, week, workout, exercises } = data;

  const exerciseList = exercises
    .map((ex, i) => {
      const subs = ex.substitutions.map((s) => s.name).join(", ");
      const priority = classifyExercise(ex.name);
      return `${i + 1}. [${priority.toUpperCase()}] ${ex.name} — ${ex.workingSets}×${ex.reps || "?"} @ RPE ${ex.rpe || "?"} (Rest: ${ex.rest || "?"})\n   Subs: ${subs || "none"}\n   Notes: ${ex.notes || "none"}`;
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

  // Essentials cross-reference for time constraints
  let essentialsSection = "";
  const workoutType = workout.type ?? "full";
  const essentials = await getEssentialsWorkout(workoutType);
  if (essentials) {
    const essList = essentials.exercises
      .map((e, i) => `${i + 1}. ${e.name} — ${e.workingSets}×${e.reps || "?"}`)
      .join("\n");
    essentialsSection = `\nESSENTIALS ALTERNATIVE (${essentials.programName} - ${essentials.workoutName}, ~45 min):\n${essList}`;
  }

  return `You are a workout coaching assistant for Austin. You parse workout input, log sets, and give coaching feedback.

CURRENT PROGRAM: ${program.name}
PHASE: ${phase.name ?? "Phase " + phase.phaseNumber} | WEEK: ${week.weekNumber}
WORKOUT: ${workout.name} (${workout.type})

TODAY'S EXERCISES:
${exerciseList}

${historyLines.length > 0 ? "RECENT HISTORY (last 4 sessions per exercise):\n" + historyLines.join("\n") : "No previous history yet."}
${essentialsSection}

RULES:
- When the user types something like "bench 225 5 5 4", parse it as: exercise match → weight → reps per set. Call the logSets tool to record it.
- Match shorthand to today's exercises (e.g., "bench" → "Bench Press", "arnold" → "Standing Dumbbell Arnold Press")
- After logging via tool, compare against prescribed targets (rep range, RPE) and previous sessions
- If weight/reps went up from last session, acknowledge it. If down, suggest staying at same weight.
- When user says equipment is taken/unavailable, suggest the substitution options listed above
- When user says "only have X minutes", you have two options:
  1. Trim the current workout: cut TERTIARY exercises first, then reduce sets on SECONDARY. Never cut PRIMARY.
  2. Suggest the Essentials alternative workout listed below (designed for ~45 min sessions).
  Present both options and let the user choose.
- When user says "done" or "finished", call the endWorkout tool, then summarize: duration, exercises completed, trends
- When user says "skip" or "skip exercise", acknowledge it, tell them what the next exercise is, and move on. Don't log anything for skipped exercises.
- When user says "help", briefly explain: type exercise name + weight + reps per set (e.g., "bench 225 5 5 4"). They can say "done" to end, "skip exercise" to skip, or ask about substitutions if equipment is taken.
- When user asks about plates, loading, or "what goes on the bar", use the calculatePlates tool.
- Be concise. Speak like a training partner, not a textbook.
- Always use the logSets tool to record data before giving feedback.
- Always use the endWorkout tool when the user indicates they're done.
- Keep your opening message SHORT. List exercises in a compact numbered list (name + sets×reps only). No tables, no markdown headers. Just the list and a brief "Let's start with [first exercise]."`;

}
