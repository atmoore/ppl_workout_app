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
  exerciseMaxes,
} from "./schema";
import { eq, desc, sql, and } from "drizzle-orm";

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

  // Get substitutions for all exercises in one query
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
      } else {
        // Program complete — set sentinel value
        await db
          .update(userProfile)
          .set({
            currentDayNumber: 0,
          })
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

export async function getAllPrograms() {
  return db.select().from(programs).orderBy(programs.name);
}

export async function getAllProgramsWithDetails() {
  // Fetch all programs + all phases in just 2 queries
  const [allPrograms, allPhases] = await Promise.all([
    db.select().from(programs).orderBy(programs.name),
    db.select().from(phases).orderBy(phases.programId, phases.phaseNumber),
  ]);

  // Single aggregation query for all counts across all programs
  const stats = await db
    .select({
      programId: phases.programId,
      totalWeeks: sql<number>`count(distinct ${weeks.id})`,
      totalWorkouts: sql<number>`count(distinct ${workoutTemplates.id})`,
      totalExercises: sql<number>`count(distinct ${exerciseTemplates.id})`,
    })
    .from(phases)
    .leftJoin(weeks, eq(weeks.phaseId, phases.id))
    .leftJoin(workoutTemplates, eq(workoutTemplates.weekId, weeks.id))
    .leftJoin(exerciseTemplates, eq(exerciseTemplates.workoutTemplateId, workoutTemplates.id))
    .groupBy(phases.programId);

  const statsMap = new Map(stats.map(s => [s.programId, s]));
  const phasesMap = new Map<number, typeof allPhases>();
  for (const phase of allPhases) {
    if (!phasesMap.has(phase.programId)) phasesMap.set(phase.programId, []);
    phasesMap.get(phase.programId)!.push(phase);
  }

  return allPrograms.map(program => {
    const programPhases = phasesMap.get(program.id) || [];
    const s = statsMap.get(program.id);
    return {
      ...program,
      phaseCount: programPhases.length,
      totalWeeks: Number(s?.totalWeeks) || 0,
      totalWorkouts: Number(s?.totalWorkouts) || 0,
      totalExercises: Number(s?.totalExercises) || 0,
      phaseNames: programPhases.map(p => p.name ?? `Phase ${p.phaseNumber}`),
    };
  });
}

export async function switchProgram(programId: number) {
  let profile = await getUserProfile();

  // Create profile if it doesn't exist
  if (!profile) {
    const [newProfile] = await db
      .insert(userProfile)
      .values({ units: "lbs" })
      .returning();
    profile = newProfile;
  }

  // Get first phase of the new program
  const programPhases = await db
    .select()
    .from(phases)
    .where(eq(phases.programId, programId))
    .orderBy(phases.phaseNumber);

  const firstPhase = programPhases[0];
  if (!firstPhase) return;

  await db
    .update(userProfile)
    .set({
      currentProgramId: programId,
      currentPhaseId: firstPhase.id,
      currentWeekNumber: 1,
      currentDayNumber: 1,
    })
    .where(eq(userProfile.id, profile.id));
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

export async function getExerciseMaxes() {
  return db.select().from(exerciseMaxes).orderBy(desc(exerciseMaxes.updatedAt));
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

export async function getEssentialsWorkout(workoutType: string) {
  // Find an Essentials program
  const essentialsPrograms = await db
    .select()
    .from(programs)
    .where(sql`${programs.name} LIKE '%Essentials%'`);

  if (essentialsPrograms.length === 0) return null;

  // Get first phase, first week
  const program = essentialsPrograms[0];
  const [phase] = await db
    .select()
    .from(phases)
    .where(eq(phases.programId, program.id))
    .orderBy(phases.phaseNumber)
    .limit(1);
  if (!phase) return null;

  const [week] = await db
    .select()
    .from(weeks)
    .where(eq(weeks.phaseId, phase.id))
    .orderBy(weeks.weekNumber)
    .limit(1);
  if (!week) return null;

  // Find all workouts in that week
  const workouts = await db
    .select()
    .from(workoutTemplates)
    .where(eq(workoutTemplates.weekId, week.id));

  // Match by type
  const typeMap: Record<string, string[]> = {
    push: ["push", "upper"],
    pull: ["pull", "upper"],
    legs: ["legs", "lower"],
    upper: ["upper", "push"],
    lower: ["lower", "legs"],
    full: ["full", "upper"],
  };

  const matchTypes = typeMap[workoutType.toLowerCase()] || [workoutType.toLowerCase()];
  const match = workouts.find(w => matchTypes.includes(w.type?.toLowerCase() ?? ""));

  if (!match) return null;

  const exercises = await db
    .select()
    .from(exerciseTemplates)
    .where(eq(exerciseTemplates.workoutTemplateId, match.id))
    .orderBy(exerciseTemplates.order);

  return {
    programName: program.name,
    workoutName: match.name,
    exercises: exercises.map(e => ({
      name: e.name,
      workingSets: e.workingSets,
      reps: e.reps,
      rpe: e.rpe,
    })),
  };
}

export async function getExerciseProgressData(exerciseName: string) {
  const logs = await db
    .select({
      date: workoutSessions.date,
      weight: setLogs.weight,
      reps: setLogs.reps,
    })
    .from(setLogs)
    .innerJoin(workoutSessions, eq(setLogs.sessionId, workoutSessions.id))
    .where(eq(setLogs.exerciseName, exerciseName))
    .orderBy(workoutSessions.date);

  // Group by date, take max weight per date
  const byDate = new Map<string, number>();
  for (const log of logs) {
    const date = log.date ?? "";
    const weight = Number(log.weight) || 0;
    if (!byDate.has(date) || weight > byDate.get(date)!) {
      byDate.set(date, weight);
    }
  }

  return Array.from(byDate.entries()).map(([date, weight]) => ({ date, weight }));
}

export async function getTopExercises(limit: number = 8) {
  // Get exercises with the most logged sets
  const result = await db
    .select({
      exerciseName: setLogs.exerciseName,
    })
    .from(setLogs)
    .groupBy(setLogs.exerciseName)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);

  return result.map(r => r.exerciseName).filter(Boolean) as string[];
}

export async function getWeeklyInsights() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const dateStr = sevenDaysAgo.toISOString().split("T")[0];

  // Single query: join sessions with set logs and aggregate
  const [result] = await db
    .select({
      workouts: sql<number>`count(distinct ${workoutSessions.id})`,
      totalSets: sql<number>`count(${setLogs.id})`,
      totalVolume: sql<number>`coalesce(sum(cast(${setLogs.weight} as numeric) * ${setLogs.reps}), 0)`,
      totalMinutes: sql<number>`coalesce(sum(distinct ${workoutSessions.durationMinutes}), 0)`,
      uniqueExercises: sql<number>`count(distinct ${setLogs.exerciseName})`,
    })
    .from(workoutSessions)
    .leftJoin(setLogs, eq(setLogs.sessionId, workoutSessions.id))
    .where(
      and(
        eq(workoutSessions.status, "completed"),
        sql`${workoutSessions.date} >= ${dateStr}`
      )
    );

  return {
    workouts: Number(result?.workouts) || 0,
    totalSets: Number(result?.totalSets) || 0,
    totalVolume: Number(result?.totalVolume) || 0,
    totalMinutes: Number(result?.totalMinutes) || 0,
    uniqueExercises: Number(result?.uniqueExercises) || 0,
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
