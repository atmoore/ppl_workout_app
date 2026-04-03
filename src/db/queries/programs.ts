import { db } from "../index";
import {
  programs,
  phases,
  weeks,
  workoutTemplates,
  exerciseTemplates,
  userProfile,
} from "../schema";
import { eq, sql } from "drizzle-orm";
import { getUserProfile } from "./workouts";

export async function getAllPrograms() {
  return db.select().from(programs).orderBy(programs.name);
}

export async function getAllProgramsWithDetails() {
  const [allPrograms, allPhases] = await Promise.all([
    db.select().from(programs).orderBy(programs.name),
    db.select().from(phases).orderBy(phases.programId, phases.phaseNumber),
  ]);

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

  if (!profile) {
    const [newProfile] = await db
      .insert(userProfile)
      .values({ units: "lbs" })
      .returning();
    profile = newProfile;
  }

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

export async function getEssentialsWorkout(workoutType: string) {
  const essentialsPrograms = await db
    .select()
    .from(programs)
    .where(sql`${programs.name} LIKE '%Essentials%'`);

  if (essentialsPrograms.length === 0) return null;

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

  const workouts = await db
    .select()
    .from(workoutTemplates)
    .where(eq(workoutTemplates.weekId, week.id));

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
