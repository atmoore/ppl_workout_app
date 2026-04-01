CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer,
	"role" varchar(20),
	"content" text,
	"parsed_data" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "exercise_maxes" (
	"id" serial PRIMARY KEY NOT NULL,
	"exercise_name" text NOT NULL,
	"weight" numeric(7, 2),
	"estimated_1rm" numeric(7, 2),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "exercise_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"workout_template_id" integer NOT NULL,
	"order" integer NOT NULL,
	"name" text NOT NULL,
	"warmup_sets" varchar(10),
	"working_sets" integer,
	"reps" varchar(30),
	"rpe" varchar(20),
	"rest" varchar(20),
	"notes" text,
	"video_url" text
);
--> statement-breakpoint
CREATE TABLE "phases" (
	"id" serial PRIMARY KEY NOT NULL,
	"program_id" integer NOT NULL,
	"phase_number" integer NOT NULL,
	"name" text,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" varchar NOT NULL,
	"frequency" integer,
	"description" text,
	"source_file" text,
	CONSTRAINT "programs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "set_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"exercise_name" text,
	"set_number" integer,
	"set_type" varchar(20) DEFAULT 'working',
	"weight" numeric(7, 2),
	"reps" integer,
	"rpe" numeric(3, 1),
	"completed" boolean DEFAULT true,
	"substituted_for" text
);
--> statement-breakpoint
CREATE TABLE "substitutions" (
	"id" serial PRIMARY KEY NOT NULL,
	"exercise_template_id" integer NOT NULL,
	"option_number" integer NOT NULL,
	"name" text NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "user_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"units" varchar(5) DEFAULT 'lbs',
	"current_program_id" integer,
	"current_phase_id" integer,
	"current_week_number" integer DEFAULT 1,
	"current_day_number" integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE "weeks" (
	"id" serial PRIMARY KEY NOT NULL,
	"phase_id" integer NOT NULL,
	"week_number" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"workout_template_id" integer,
	"date" varchar(10),
	"started_at" timestamp,
	"completed_at" timestamp,
	"duration_minutes" integer,
	"status" varchar(20) DEFAULT 'active',
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "workout_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"week_id" integer NOT NULL,
	"day_number" integer NOT NULL,
	"name" text,
	"type" varchar(20)
);
--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_session_id_workout_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."workout_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_templates" ADD CONSTRAINT "exercise_templates_workout_template_id_workout_templates_id_fk" FOREIGN KEY ("workout_template_id") REFERENCES "public"."workout_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phases" ADD CONSTRAINT "phases_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "set_logs" ADD CONSTRAINT "set_logs_session_id_workout_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."workout_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "substitutions" ADD CONSTRAINT "substitutions_exercise_template_id_exercise_templates_id_fk" FOREIGN KEY ("exercise_template_id") REFERENCES "public"."exercise_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_current_program_id_programs_id_fk" FOREIGN KEY ("current_program_id") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_current_phase_id_phases_id_fk" FOREIGN KEY ("current_phase_id") REFERENCES "public"."phases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weeks" ADD CONSTRAINT "weeks_phase_id_phases_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."phases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_workout_template_id_workout_templates_id_fk" FOREIGN KEY ("workout_template_id") REFERENCES "public"."workout_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_templates" ADD CONSTRAINT "workout_templates_week_id_weeks_id_fk" FOREIGN KEY ("week_id") REFERENCES "public"."weeks"("id") ON DELETE no action ON UPDATE no action;