import { db } from "./index";
import {
  userProfile,
  programs,
  phases,
  weeks,
  workoutTemplates,
  exerciseTemplates,
  substitutions,
  setLogs,
  workoutSessions,
} from "./schema";
import { eq, desc } from "drizzle-orm";

export type UserProfile = typeof userProfile.$inferSelect;
export type Program = typeof programs.$inferSelect;
export type Phase = typeof phases.$inferSelect;
export type Week = typeof weeks.$inferSelect;
export type WorkoutTemplate = typeof workoutTemplates.$inferSelect;
export type ExerciseTemplate = typeof exerciseTemplates.$inferSelect;
export type Substitution = typeof substitutions.$inferSelect;

export type CurrentWorkoutData = {
  profile: UserProfile;
  program: Program;
  phase: Phase;
  week: Week;
  workout: WorkoutTemplate;
  exercises: Array<ExerciseTemplate & { substitutions: Substitution[] }>;
  totalDaysInWeek: number;
};

export async function getUserProfile(): Promise<UserProfile | null> {
  const rows = await db.select().from(userProfile).limit(1);
  return rows[0] ?? null;
}

export async function getCurrentWorkout(): Promise<CurrentWorkoutData | null> {
  const profile = await getUserProfile();
  if (!profile) return null;
  if (!profile.currentProgramId || !profile.currentPhaseId) return null;

  // Find the current week matching phaseId + weekNumber
  const weekRows = await db
    .select()
    .from(weeks)
    .where(eq(weeks.phaseId, profile.currentPhaseId));

  const currentWeekNumber = profile.currentWeekNumber ?? 1;
  const week = weekRows.find((w) => w.weekNumber === currentWeekNumber);
  if (!week) return null;

  // Find all workouts in that week
  const allWorkoutsInWeek = await db
    .select()
    .from(workoutTemplates)
    .where(eq(workoutTemplates.weekId, week.id));

  const currentDayNumber = profile.currentDayNumber ?? 1;
  const workout = allWorkoutsInWeek.find(
    (wt) => wt.dayNumber === currentDayNumber
  );
  if (!workout) return null;

  // Get all exercises for this workout ordered by order
  const exerciseRows = await db
    .select()
    .from(exerciseTemplates)
    .where(eq(exerciseTemplates.workoutTemplateId, workout.id))
    .orderBy(exerciseTemplates.order);

  // Get substitutions for all exercises
  const exercisesWithSubs = await Promise.all(
    exerciseRows.map(async (exercise) => {
      const subs = await db
        .select()
        .from(substitutions)
        .where(eq(substitutions.exerciseTemplateId, exercise.id));
      return { ...exercise, substitutions: subs };
    })
  );

  // Get program and phase records
  const programRows = await db
    .select()
    .from(programs)
    .where(eq(programs.id, profile.currentProgramId!));
  const program = programRows[0];
  if (!program) return null;

  const phaseRows = await db
    .select()
    .from(phases)
    .where(eq(phases.id, profile.currentPhaseId!));
  const phase = phaseRows[0];
  if (!phase) return null;

  return {
    profile,
    program,
    phase,
    week,
    workout,
    exercises: exercisesWithSubs,
    totalDaysInWeek: allWorkoutsInWeek.length,
  };
}

export async function advanceDay(): Promise<void> {
  const profile = await getUserProfile();
  if (!profile) return;
  if (!profile.currentPhaseId) return;

  const currentWeekNumber = profile.currentWeekNumber ?? 1;
  const currentDayNumber = profile.currentDayNumber ?? 1;

  // Find current week
  const weekRows = await db
    .select()
    .from(weeks)
    .where(eq(weeks.phaseId, profile.currentPhaseId));

  const currentWeek = weekRows.find((w) => w.weekNumber === currentWeekNumber);
  if (!currentWeek) return;

  // Find all workouts in current week to get totalDaysInWeek
  const workoutsInWeek = await db
    .select()
    .from(workoutTemplates)
    .where(eq(workoutTemplates.weekId, currentWeek.id));

  const totalDaysInWeek = workoutsInWeek.length;

  let nextDayNumber = currentDayNumber + 1;
  let nextWeekNumber = currentWeekNumber;
  let nextPhaseId = profile.currentPhaseId;

  if (nextDayNumber > totalDaysInWeek) {
    // Advance to next week
    nextDayNumber = 1;
    nextWeekNumber = currentWeekNumber + 1;

    // Check if past last week in phase
    const maxWeekNumber = Math.max(...weekRows.map((w) => w.weekNumber));
    if (nextWeekNumber > maxWeekNumber) {
      // Advance to next phase
      nextWeekNumber = 1;

      if (!profile.currentProgramId) return;

      const allPhases = await db
        .select()
        .from(phases)
        .where(eq(phases.programId, profile.currentProgramId));

      const currentPhase = allPhases.find((p) => p.id === profile.currentPhaseId);
      if (!currentPhase) return;

      const nextPhaseNumber = currentPhase.phaseNumber + 1;
      const nextPhase = allPhases.find((p) => p.phaseNumber === nextPhaseNumber);

      if (nextPhase) {
        nextPhaseId = nextPhase.id;
      }
      // If no next phase, stay (program complete) — nextPhaseId remains current
    }
  }

  await db
    .update(userProfile)
    .set({
      currentDayNumber: nextDayNumber,
      currentWeekNumber: nextWeekNumber,
      currentPhaseId: nextPhaseId,
    })
    .where(eq(userProfile.id, profile.id));
}

export async function getWeekWorkouts() {
  const profile = await getUserProfile();
  if (!profile?.currentProgramId || !profile.currentPhaseId) return null;

  // Find current week
  const currentWeeks = await db
    .select()
    .from(weeks)
    .where(eq(weeks.phaseId, profile.currentPhaseId));

  const currentWeek = currentWeeks.find(w => w.weekNumber === profile.currentWeekNumber);
  if (!currentWeek) return null;

  // Get ALL workouts for this week with their exercises
  const workoutRows = await db
    .select()
    .from(workoutTemplates)
    .where(eq(workoutTemplates.weekId, currentWeek.id))
    .orderBy(workoutTemplates.dayNumber);

  const workoutsWithExercises = await Promise.all(
    workoutRows.map(async (workout) => {
      const exercisesRaw = await db
        .select()
        .from(exerciseTemplates)
        .where(eq(exerciseTemplates.workoutTemplateId, workout.id))
        .orderBy(exerciseTemplates.order);
      return { ...workout, exercises: exercisesRaw };
    })
  );

  // Get program and phase for context
  const [program] = await db.select().from(programs).where(eq(programs.id, profile.currentProgramId!));
  const [phase] = await db.select().from(phases).where(eq(phases.id, profile.currentPhaseId!));

  return {
    profile,
    program,
    phase,
    weekNumber: currentWeek.weekNumber,
    workouts: workoutsWithExercises,
    currentDayNumber: profile.currentDayNumber ?? 1,
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
