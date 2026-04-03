import { db } from "../index";
import {
  userProfile,
  programs,
  phases,
  weeks,
  workoutTemplates,
  exerciseTemplates,
  substitutions,
} from "../schema";
import { eq, sql } from "drizzle-orm";

// ─── Types ──────────────────────────────────────────────────────────────────

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

// ─── Queries ────────────────────────────────────────────────────────────────

export async function getUserProfile(): Promise<UserProfile | null> {
  const rows = await db.select().from(userProfile).limit(1);
  return rows[0] ?? null;
}

export async function getCurrentWorkout(): Promise<CurrentWorkoutData | null> {
  const profile = await getUserProfile();
  if (!profile) return null;
  if (!profile.currentProgramId || !profile.currentPhaseId) return null;

  const weekRows = await db
    .select()
    .from(weeks)
    .where(eq(weeks.phaseId, profile.currentPhaseId));

  const currentWeekNumber = profile.currentWeekNumber ?? 1;
  const week = weekRows.find((w) => w.weekNumber === currentWeekNumber);
  if (!week) return null;

  const allWorkoutsInWeek = await db
    .select()
    .from(workoutTemplates)
    .where(eq(workoutTemplates.weekId, week.id));

  const currentDayNumber = profile.currentDayNumber ?? 1;
  const workout = allWorkoutsInWeek.find((wt) => wt.dayNumber === currentDayNumber);
  if (!workout) return null;

  const exerciseRows = await db
    .select()
    .from(exerciseTemplates)
    .where(eq(exerciseTemplates.workoutTemplateId, workout.id))
    .orderBy(exerciseTemplates.order);

  // Batch substitutions in one query
  const exerciseIds = exerciseRows.map(e => e.id);
  const allSubs = exerciseIds.length > 0
    ? await db.select().from(substitutions).where(sql`${substitutions.exerciseTemplateId} IN (${sql.join(exerciseIds.map(id => sql`${id}`), sql`, `)})`)
    : [];
  const subsByExercise = new Map<number, typeof allSubs>();
  for (const sub of allSubs) {
    if (!subsByExercise.has(sub.exerciseTemplateId)) subsByExercise.set(sub.exerciseTemplateId, []);
    subsByExercise.get(sub.exerciseTemplateId)!.push(sub);
  }
  const exercisesWithSubs = exerciseRows.map(exercise => ({
    ...exercise,
    substitutions: subsByExercise.get(exercise.id) || [],
  }));

  const programRows = await db.select().from(programs).where(eq(programs.id, profile.currentProgramId!));
  const program = programRows[0];
  if (!program) return null;

  const phaseRows = await db.select().from(phases).where(eq(phases.id, profile.currentPhaseId!));
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

export async function getWeekWorkouts() {
  const profile = await getUserProfile();
  if (!profile?.currentProgramId || !profile.currentPhaseId) return null;

  const currentWeeks = await db
    .select()
    .from(weeks)
    .where(eq(weeks.phaseId, profile.currentPhaseId));

  const currentWeek = currentWeeks.find(w => w.weekNumber === profile.currentWeekNumber);
  if (!currentWeek) return null;

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

  const [program] = await db.select().from(programs).where(eq(programs.id, profile.currentProgramId!));
  const [phase] = await db.select().from(phases).where(eq(phases.id, profile.currentPhaseId!));

  const { getTodaySession } = await import("./sessions");
  const todaySession = await getTodaySession();

  return {
    profile,
    program,
    phase,
    weekNumber: currentWeek.weekNumber,
    workouts: workoutsWithExercises,
    currentDayNumber: profile.currentDayNumber ?? 1,
    todaySession,
    programComplete: profile.currentDayNumber === 0,
  };
}

export async function advanceDay(): Promise<void> {
  const profile = await getUserProfile();
  if (!profile) return;
  if (!profile.currentPhaseId) return;

  const currentWeekNumber = profile.currentWeekNumber ?? 1;
  const currentDayNumber = profile.currentDayNumber ?? 1;

  const weekRows = await db
    .select()
    .from(weeks)
    .where(eq(weeks.phaseId, profile.currentPhaseId));

  const currentWeek = weekRows.find((w) => w.weekNumber === currentWeekNumber);
  if (!currentWeek) return;

  const workoutsInWeek = await db
    .select()
    .from(workoutTemplates)
    .where(eq(workoutTemplates.weekId, currentWeek.id));

  const totalDaysInWeek = workoutsInWeek.length;

  let nextDayNumber = currentDayNumber + 1;
  let nextWeekNumber = currentWeekNumber;
  let nextPhaseId = profile.currentPhaseId;

  if (nextDayNumber > totalDaysInWeek) {
    nextDayNumber = 1;
    nextWeekNumber = currentWeekNumber + 1;

    const maxWeekNumber = Math.max(...weekRows.map((w) => w.weekNumber));
    if (nextWeekNumber > maxWeekNumber) {
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
      } else {
        // Program complete
        await db
          .update(userProfile)
          .set({ currentDayNumber: 0 })
          .where(eq(userProfile.id, profile.id));
        return;
      }
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
