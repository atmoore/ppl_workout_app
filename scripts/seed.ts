import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";
import fs from "fs";
import path from "path";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

interface SubstitutionData {
  option_number: number;
  name: string;
  notes?: string;
}

interface ExerciseData {
  order: number;
  name: string;
  warmup_sets?: string;
  working_sets?: number | string;
  reps?: string;
  rpe?: string;
  rest?: string;
  notes?: string;
  video_url?: string;
  substitutions?: SubstitutionData[];
}

function toInt(val: number | string | undefined | null): number | null {
  if (val === undefined || val === null) return null;
  if (typeof val === "number") return isNaN(val) ? null : val;
  const parsed = parseInt(String(val), 10);
  return isNaN(parsed) ? null : parsed;
}

interface WorkoutData {
  name: string;
  type: string;
  day_number: number;
  exercises?: ExerciseData[];
}

interface WeekData {
  week_number: number;
  workouts?: WorkoutData[];
}

interface PhaseData {
  phase_number: number;
  name?: string;
  description?: string | null;
  weeks?: WeekData[];
}

interface ProgramData {
  name: string;
  slug: string;
  frequency?: number;
  description?: string;
  source_file?: string;
  phases?: PhaseData[];
}

async function seed() {
  const seedDir = path.join(process.cwd(), "scripts/seed-data");
  const files = fs
    .readdirSync(seedDir)
    .filter((f) => f.endsWith(".json"))
    .sort();

  console.log(`Found ${files.length} seed files: ${files.join(", ")}\n`);

  let firstProgramId: number | null = null;
  let firstPhaseId: number | null = null;

  for (const file of files) {
    const filePath = path.join(seedDir, file);
    const data: ProgramData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    console.log(`Seeding program: ${data.name}`);

    // Insert program
    const [program] = await db
      .insert(schema.programs)
      .values({
        name: data.name,
        slug: data.slug,
        frequency: data.frequency ?? null,
        description: data.description ?? null,
        sourceFile: data.source_file ?? null,
      })
      .returning();

    console.log(`  → Program inserted (id=${program.id})`);

    if (firstProgramId === null) firstProgramId = program.id;

    for (const phaseData of data.phases ?? []) {
      const [phase] = await db
        .insert(schema.phases)
        .values({
          programId: program.id,
          phaseNumber: phaseData.phase_number,
          name: phaseData.name ?? null,
          description: phaseData.description ?? null,
        })
        .returning();

      if (firstPhaseId === null) firstPhaseId = phase.id;

      console.log(
        `    Phase ${phaseData.phase_number}: "${phaseData.name}" (id=${phase.id})`
      );

      for (const weekData of phaseData.weeks ?? []) {
        const [week] = await db
          .insert(schema.weeks)
          .values({
            phaseId: phase.id,
            weekNumber: weekData.week_number,
          })
          .returning();

        for (const workoutData of weekData.workouts ?? []) {
          const [workout] = await db
            .insert(schema.workoutTemplates)
            .values({
              weekId: week.id,
              dayNumber: workoutData.day_number,
              name: workoutData.name ?? null,
              type: workoutData.type ?? null,
            })
            .returning();

          for (const exerciseData of workoutData.exercises ?? []) {
            const [exercise] = await db
              .insert(schema.exerciseTemplates)
              .values({
                workoutTemplateId: workout.id,
                order: exerciseData.order,
                name: exerciseData.name,
                warmupSets: exerciseData.warmup_sets ?? null,
                workingSets: toInt(exerciseData.working_sets),
                reps: exerciseData.reps ?? null,
                rpe: exerciseData.rpe ?? null,
                rest: exerciseData.rest ?? null,
                notes: exerciseData.notes ?? null,
                videoUrl: exerciseData.video_url ?? null,
              })
              .returning();

            for (const subData of exerciseData.substitutions ?? []) {
              await db.insert(schema.substitutions).values({
                exerciseTemplateId: exercise.id,
                optionNumber: subData.option_number,
                name: subData.name,
                notes: subData.notes ?? null,
              });
            }
          }
        }
      }
    }

    console.log(`  Done with ${data.name}\n`);
  }

  // Insert default user profile pointing to first program/phase
  if (firstProgramId !== null && firstPhaseId !== null) {
    const [profile] = await db
      .insert(schema.userProfile)
      .values({
        units: "lbs",
        currentProgramId: firstProgramId,
        currentPhaseId: firstPhaseId,
        currentWeekNumber: 1,
        currentDayNumber: 1,
      })
      .returning();

    console.log(
      `Default user profile created (id=${profile.id}, programId=${firstProgramId}, phaseId=${firstPhaseId})`
    );
  }

  console.log("\nSeeding complete.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
