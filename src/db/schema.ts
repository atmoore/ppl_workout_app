import {
  pgTable,
  serial,
  text,
  integer,
  varchar,
  boolean,
  decimal,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Program Data (seeded) ───────────────────────────────────────────────────

export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: varchar("slug").unique().notNull(),
  frequency: integer("frequency"),
  description: text("description"),
  sourceFile: text("source_file"),
});

export const phases = pgTable("phases", {
  id: serial("id").primaryKey(),
  programId: integer("program_id")
    .notNull()
    .references(() => programs.id),
  phaseNumber: integer("phase_number").notNull(),
  name: text("name"),
  description: text("description"),
});

export const weeks = pgTable("weeks", {
  id: serial("id").primaryKey(),
  phaseId: integer("phase_id")
    .notNull()
    .references(() => phases.id),
  weekNumber: integer("week_number").notNull(),
});

export const workoutTemplates = pgTable("workout_templates", {
  id: serial("id").primaryKey(),
  weekId: integer("week_id")
    .notNull()
    .references(() => weeks.id),
  dayNumber: integer("day_number").notNull(),
  name: text("name"),
  type: varchar("type", { length: 20 }),
});

export const exerciseTemplates = pgTable("exercise_templates", {
  id: serial("id").primaryKey(),
  workoutTemplateId: integer("workout_template_id")
    .notNull()
    .references(() => workoutTemplates.id),
  order: integer("order").notNull(),
  name: text("name").notNull(),
  warmupSets: varchar("warmup_sets", { length: 10 }),
  workingSets: integer("working_sets"),
  reps: varchar("reps", { length: 30 }),
  rpe: varchar("rpe", { length: 20 }),
  rest: varchar("rest", { length: 20 }),
  notes: text("notes"),
  videoUrl: text("video_url"),
});

export const substitutions = pgTable("substitutions", {
  id: serial("id").primaryKey(),
  exerciseTemplateId: integer("exercise_template_id")
    .notNull()
    .references(() => exerciseTemplates.id),
  optionNumber: integer("option_number").notNull(),
  name: text("name").notNull(),
  notes: text("notes"),
});

// ─── User Data ───────────────────────────────────────────────────────────────

export const userProfile = pgTable("user_profile", {
  id: serial("id").primaryKey(),
  units: varchar("units", { length: 5 }).default("lbs"),
  currentProgramId: integer("current_program_id").references(() => programs.id),
  currentPhaseId: integer("current_phase_id").references(() => phases.id),
  currentWeekNumber: integer("current_week_number").default(1),
  currentDayNumber: integer("current_day_number").default(1),
});

export const exerciseMaxes = pgTable("exercise_maxes", {
  id: serial("id").primaryKey(),
  exerciseName: text("exercise_name").notNull(),
  weight: decimal("weight", { precision: 7, scale: 2 }),
  estimated1rm: decimal("estimated_1rm", { precision: 7, scale: 2 }),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const workoutSessions = pgTable("workout_sessions", {
  id: serial("id").primaryKey(),
  workoutTemplateId: integer("workout_template_id").references(
    () => workoutTemplates.id
  ),
  date: varchar("date", { length: 10 }),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  durationMinutes: integer("duration_minutes"),
  status: varchar("status", { length: 20 }).default("active"),
  notes: text("notes"),
});

export const setLogs = pgTable("set_logs", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => workoutSessions.id),
  exerciseName: text("exercise_name"),
  setNumber: integer("set_number"),
  setType: varchar("set_type", { length: 20 }).default("working"),
  weight: decimal("weight", { precision: 7, scale: 2 }),
  reps: integer("reps"),
  rpe: decimal("rpe", { precision: 3, scale: 1 }),
  completed: boolean("completed").default(true),
  substitutedFor: text("substituted_for"),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => workoutSessions.id),
  role: varchar("role", { length: 20 }),
  content: text("content"),
  parsedData: jsonb("parsed_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Relations ───────────────────────────────────────────────────────────────

export const programsRelations = relations(programs, ({ many }) => ({
  phases: many(phases),
}));

export const phasesRelations = relations(phases, ({ one, many }) => ({
  program: one(programs, {
    fields: [phases.programId],
    references: [programs.id],
  }),
  weeks: many(weeks),
}));

export const weeksRelations = relations(weeks, ({ one, many }) => ({
  phase: one(phases, {
    fields: [weeks.phaseId],
    references: [phases.id],
  }),
  workoutTemplates: many(workoutTemplates),
}));

export const workoutTemplatesRelations = relations(
  workoutTemplates,
  ({ one, many }) => ({
    week: one(weeks, {
      fields: [workoutTemplates.weekId],
      references: [weeks.id],
    }),
    exerciseTemplates: many(exerciseTemplates),
  })
);

export const exerciseTemplatesRelations = relations(
  exerciseTemplates,
  ({ one, many }) => ({
    workoutTemplate: one(workoutTemplates, {
      fields: [exerciseTemplates.workoutTemplateId],
      references: [workoutTemplates.id],
    }),
    substitutions: many(substitutions),
  })
);

export const substitutionsRelations = relations(substitutions, ({ one }) => ({
  exerciseTemplate: one(exerciseTemplates, {
    fields: [substitutions.exerciseTemplateId],
    references: [exerciseTemplates.id],
  }),
}));

export const workoutSessionsRelations = relations(
  workoutSessions,
  ({ one, many }) => ({
    workoutTemplate: one(workoutTemplates, {
      fields: [workoutSessions.workoutTemplateId],
      references: [workoutTemplates.id],
    }),
    setLogs: many(setLogs),
    chatMessages: many(chatMessages),
  })
);

export const setLogsRelations = relations(setLogs, ({ one }) => ({
  session: one(workoutSessions, {
    fields: [setLogs.sessionId],
    references: [workoutSessions.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(workoutSessions, {
    fields: [chatMessages.sessionId],
    references: [workoutSessions.id],
  }),
}));
