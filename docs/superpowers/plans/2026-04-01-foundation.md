# Foundation Implementation Plan (Plan 1 of 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Next.js app, define the database schema, extract all program data from Excel files, seed the database, and build the Today screen so the user can see their current workout.

**Architecture:** Next.js 16 App Router with Server Components. Drizzle ORM over Neon Postgres. Data extraction via a Node.js script that parses Excel spreadsheets into JSON, then seeds the DB. The Today screen is a Server Component that queries the user's current program/phase/week/day and renders the workout.

**Tech Stack:** Next.js 16, Tailwind CSS, shadcn/ui, Geist fonts, Drizzle ORM, Neon Postgres, openpyxl (Python, for extraction), tsx (for seed scripts)

---

## File Structure

```
ppl_workout_app/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout: Geist fonts, dark mode, bottom nav
│   │   ├── page.tsx                # Today screen (home)
│   │   ├── programs/
│   │   │   └── page.tsx            # Program browser (Plan 3)
│   │   ├── chat/
│   │   │   └── page.tsx            # Chat logger (Plan 2)
│   │   ├── progress/
│   │   │   └── page.tsx            # Progress screen (Plan 3)
│   │   └── globals.css             # Tailwind + shadcn theme overrides
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── bottom-nav.tsx          # Bottom navigation bar
│   │   ├── workout-card.tsx        # Today's workout card
│   │   └── exercise-list.tsx       # Exercise list within workout card
│   ├── db/
│   │   ├── index.ts                # Drizzle client (Neon connection)
│   │   ├── schema.ts               # All Drizzle table definitions
│   │   └── queries.ts              # Reusable query functions
│   └── lib/
│       └── utils.ts                # cn() helper (shadcn)
├── drizzle/
│   └── migrations/                 # Generated migrations
├── scripts/
│   ├── extract-programs.py         # Excel → JSON extraction
│   ├── seed-data/                  # Generated JSON from extraction
│   │   ├── ultimate-ppl-5x.json
│   │   ├── ultimate-ppl-4x.json
│   │   ├── ultimate-ppl-6x.json
│   │   ├── powerbuilding-2-4x.json
│   │   ├── powerbuilding-2-5-6x.json
│   │   ├── powerbuilding-3-5x.json
│   │   └── edited-ppl-5x.json
│   └── seed.ts                     # JSON → Neon DB seeder
├── drizzle.config.ts               # Drizzle Kit config
├── next.config.ts                  # Next.js config
├── tailwind.config.ts              # Tailwind config (if needed beyond shadcn init)
├── components.json                 # shadcn/ui config
├── package.json
├── tsconfig.json
└── .env.local                      # DATABASE_URL (pulled via vercel env pull)
```

---

### Task 1: Scaffold Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Create Next.js 16 app**

Run:
```bash
cd /Users/austinmoore/ppl_workout_app
# Remove old vanilla JS files (keep docs/, CLAUDE.md, .git, scripts/ data files)
mkdir -p /tmp/ppl_backup
cp -r docs CLAUDE.md /tmp/ppl_backup/
# Start fresh Next.js project in a temp dir, then move files
npx create-next-app@latest ppl_next --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack
```

- [ ] **Step 2: Move Next.js files into project root**

Run:
```bash
# Copy Next.js scaffold into our repo
cp -r ppl_next/* ppl_next/.* /Users/austinmoore/ppl_workout_app/ 2>/dev/null || true
rm -rf ppl_next
# Restore our docs and CLAUDE.md
cp -r /tmp/ppl_backup/* /Users/austinmoore/ppl_workout_app/
```

- [ ] **Step 3: Install Geist fonts**

Run:
```bash
npm install geist
```

- [ ] **Step 4: Configure root layout with Geist fonts and dark mode**

Edit `src/app/layout.tsx`:
```tsx
import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "PPL Tracker",
  description: "AI-powered workout companion",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased bg-zinc-950 text-zinc-50`}
      >
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Verify dev server starts**

Run:
```bash
npm run dev
```
Expected: App runs at localhost:3000 with dark background.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "scaffold: Next.js 16 with Tailwind, Geist fonts, dark mode"
```

---

### Task 2: Set up shadcn/ui

**Files:**
- Create: `components.json`, `src/lib/utils.ts`, `src/components/ui/`

- [ ] **Step 1: Initialize shadcn/ui**

Run:
```bash
npx shadcn@latest init -d
```
Select: New York style, Zinc base color, CSS variables enabled.

- [ ] **Step 2: Add core components**

Run:
```bash
npx shadcn@latest add button card tabs badge separator
```

- [ ] **Step 3: Verify components installed**

Run:
```bash
ls src/components/ui/
```
Expected: `button.tsx`, `card.tsx`, `tabs.tsx`, `badge.tsx`, `separator.tsx`

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "setup: shadcn/ui with button, card, tabs, badge, separator"
```

---

### Task 3: Set up Neon Postgres + Drizzle

**Files:**
- Create: `src/db/index.ts`, `src/db/schema.ts`, `drizzle.config.ts`

- [ ] **Step 1: Install Drizzle and Neon**

Run:
```bash
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit
```

- [ ] **Step 2: Create Drizzle config**

Create `drizzle.config.ts`:
```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

- [ ] **Step 3: Create database client**

Create `src/db/index.ts`:
```ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

- [ ] **Step 4: Define the full schema**

Create `src/db/schema.ts`:
```ts
import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  varchar,
  jsonb,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Program Data (seeded) ───

export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  frequency: integer("frequency").notNull(), // days per week
  description: text("description"),
  sourceFile: text("source_file"),
});

export const phases = pgTable("phases", {
  id: serial("id").primaryKey(),
  programId: integer("program_id")
    .notNull()
    .references(() => programs.id),
  phaseNumber: integer("phase_number").notNull(),
  name: text("name").notNull(),
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
  name: text("name").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // push, pull, legs, upper, lower, full
});

export const exerciseTemplates = pgTable("exercise_templates", {
  id: serial("id").primaryKey(),
  workoutTemplateId: integer("workout_template_id")
    .notNull()
    .references(() => workoutTemplates.id),
  order: integer("order").notNull(),
  name: text("name").notNull(),
  warmupSets: varchar("warmup_sets", { length: 10 }),
  workingSets: integer("working_sets").notNull(),
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

// ─── User Data ───

export const userProfile = pgTable("user_profile", {
  id: serial("id").primaryKey(),
  units: varchar("units", { length: 5 }).notNull().default("lbs"),
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
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  durationMinutes: integer("duration_minutes"),
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, completed, skipped
  notes: text("notes"),
});

export const setLogs = pgTable("set_logs", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => workoutSessions.id),
  exerciseName: text("exercise_name").notNull(),
  setNumber: integer("set_number").notNull(),
  setType: varchar("set_type", { length: 20 }).notNull().default("working"),
  weight: decimal("weight", { precision: 7, scale: 2 }),
  reps: integer("reps"),
  rpe: decimal("rpe", { precision: 3, scale: 1 }),
  completed: boolean("completed").default(true),
  substitutedFor: text("substituted_for"),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => workoutSessions.id),
  role: varchar("role", { length: 20 }).notNull(), // user, assistant
  content: text("content").notNull(),
  parsedData: jsonb("parsed_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Relations ───

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
```

- [ ] **Step 5: Provision Neon database**

The user must run this manually (requires Vercel dashboard interaction):
```bash
npm i -g vercel
vercel link
vercel integration add neon
vercel env pull .env.local
```
This provisions a `DATABASE_URL` in `.env.local`.

- [ ] **Step 6: Generate and run migration**

Run:
```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```
Expected: Tables created in Neon.

- [ ] **Step 7: Commit**

```bash
git add src/db/ drizzle.config.ts drizzle/
git commit -m "setup: Drizzle schema with full data model, Neon connection"
```

---

### Task 4: Extract program data from Excel files

**Files:**
- Create: `scripts/extract-programs.py`, `scripts/seed-data/*.json`

This script parses every Excel spreadsheet into a standardized JSON format that maps to our DB schema.

- [ ] **Step 1: Create extraction script**

Create `scripts/extract-programs.py`:
```python
#!/usr/bin/env python3
"""
Extract workout program data from Jeff Nippard Excel spreadsheets.
Outputs standardized JSON files into scripts/seed-data/.
"""

import json
import os
import re
from datetime import datetime
from pathlib import Path

import openpyxl

SOURCE_DIR = Path.home() / "projects" / "Jeff Nippard"
OUTPUT_DIR = Path(__file__).parent / "seed-data"
OUTPUT_DIR.mkdir(exist_ok=True)


def clean_value(val):
    """Normalize cell values from Excel quirks."""
    if val is None:
        return None
    if isinstance(val, datetime):
        # Excel interprets "3-4" as a date — extract as "M-D" string
        return f"{val.month}-{val.day}"
    if isinstance(val, (int, float)):
        if val == int(val):
            return str(int(val))
        return str(val)
    return str(val).strip()


def parse_ppl_sheet(ws, program_name, frequency):
    """Parse an Ultimate PPL-style sheet (columns A-K, row 7 = headers)."""
    phases = []
    current_phase_name = None
    current_week = None
    current_workout_name = None
    current_workout_type = None
    exercises = []
    workouts = []
    weeks = []
    exercise_order = 0

    for row in ws.iter_rows(min_row=1, max_row=ws.max_row, values_only=False):
        a = clean_value(row[0].value)  # Column A: week markers, workout names
        b = clean_value(row[1].value) if len(row) > 1 else None  # Exercise name
        c = clean_value(row[2].value) if len(row) > 2 else None  # Warmup sets
        d = clean_value(row[3].value) if len(row) > 3 else None  # Working sets
        e = clean_value(row[4].value) if len(row) > 4 else None  # Reps
        g = clean_value(row[6].value) if len(row) > 6 else None  # RPE
        h = clean_value(row[7].value) if len(row) > 7 else None  # Rest
        i_val = clean_value(row[8].value) if len(row) > 8 else None  # Sub 1
        j = clean_value(row[9].value) if len(row) > 9 else None  # Sub 2
        k = clean_value(row[10].value) if len(row) > 10 else None  # Notes

        # Skip header rows
        if a and "Exercise" in str(a):
            continue
        if b and b == "Exercise":
            continue

        # Phase title detection
        if a and ("Phase" in str(a) or "Base" in str(a) or "Maximum" in str(a) or "Supercompensation" in str(a)):
            current_phase_name = a
            continue

        # Week marker detection
        if a and a.startswith("Week"):
            # Save previous week's data
            if current_workout_name and exercises:
                workouts.append({
                    "name": current_workout_name,
                    "type": current_workout_type,
                    "exercises": exercises,
                })
                exercises = []
                exercise_order = 0
            if current_week and workouts:
                weeks.append({
                    "week_number": current_week,
                    "workouts": workouts,
                })
                workouts = []
            week_match = re.search(r"Week\s*(\d+)", a)
            current_week = int(week_match.group(1)) if week_match else 1
            current_workout_name = None
            continue

        # Rest day
        if a and ("Rest" in str(a) or "Optional" in str(a)):
            continue

        # Workout name detection (Push #1, Pull #1, Legs #1, Upper #1, Lower #1)
        if a and b and not a.startswith("Week"):
            # This row has both a workout name (col A) and an exercise (col B)
            # Save previous workout
            if current_workout_name and exercises:
                workouts.append({
                    "name": current_workout_name,
                    "type": current_workout_type,
                    "exercises": exercises,
                })
                exercises = []
                exercise_order = 0

            current_workout_name = a
            # Determine type from name
            name_lower = a.lower()
            if "push" in name_lower:
                current_workout_type = "push"
            elif "pull" in name_lower:
                current_workout_type = "pull"
            elif "leg" in name_lower:
                current_workout_type = "legs"
            elif "upper" in name_lower:
                current_workout_type = "upper"
            elif "lower" in name_lower:
                current_workout_type = "lower"
            else:
                current_workout_type = "full"

        # Exercise row
        if b and b != "Exercise" and d is not None:
            exercise_order += 1
            subs = []
            if i_val and i_val != "N/A":
                subs.append({"option_number": 1, "name": i_val.replace("\n", " ")})
            if j and j != "N/A":
                subs.append({"option_number": 2, "name": j.replace("\n", " ")})

            exercises.append({
                "order": exercise_order,
                "name": b,
                "warmup_sets": c or "0",
                "working_sets": int(float(d)) if d else 1,
                "reps": e,
                "rpe": g,
                "rest": h,
                "notes": k,
                "substitutions": subs,
            })

    # Save last workout/week
    if current_workout_name and exercises:
        workouts.append({
            "name": current_workout_name,
            "type": current_workout_type,
            "exercises": exercises,
        })
    if current_week and workouts:
        weeks.append({
            "week_number": current_week,
            "workouts": workouts,
        })
    elif workouts:
        weeks.append({
            "week_number": 1,
            "workouts": workouts,
        })

    return weeks


def parse_pb_sheet(ws, program_name, frequency):
    """Parse a Powerbuilding-style sheet (slightly different layout)."""
    weeks = []
    current_week = None
    current_workout_name = None
    current_workout_type = None
    exercises = []
    workouts = []
    exercise_order = 0
    day_counter = 0

    # Determine column offsets - PB 2.0 uses B-K, PB 3.0 uses A-J
    # Detect by checking if "Exercise" is in column B or C of header row
    is_pb2 = "POWERBUILDING PHASE 2.0" in str(ws["B1"].value or "")
    is_pb3 = "Powerbuilding System" in str(ws["A1"].value or "")

    if is_pb2:
        col_offset = 1  # B=workout name, C=exercise, D=warmup...
    else:
        col_offset = 0  # A=workout name, B=exercise, C=warmup...

    for row in ws.iter_rows(min_row=1, max_row=ws.max_row, values_only=False):
        def cell(idx):
            actual = idx + col_offset
            if actual < len(row):
                return clean_value(row[actual].value)
            return None

        a = cell(0)  # Workout label / week
        b = cell(1)  # Exercise name
        c = cell(2)  # Warmup sets
        d = cell(3)  # Working sets
        e = cell(4)  # Reps
        # g = RPE (skip Load column for PB)
        g = cell(7) if is_pb2 else cell(7)  # RPE
        h = cell(8) if is_pb2 else cell(8)  # Rest
        k = cell(9) if is_pb2 else cell(9)  # Notes

        # For PB format, RPE and Rest are at different columns
        if is_pb2:
            g = cell(7)  # I = RPE
            h = cell(8)  # J = Rest
            k = cell(9)  # K = Notes
        elif is_pb3:
            g = cell(6)  # H = RPE
            h = cell(7)  # I = Rest
            k = cell(8)  # J = Notes

        if a and "Exercise" in str(a):
            continue
        if b and b == "Exercise":
            continue

        # Week marker
        if a and str(a).startswith("Week"):
            if current_workout_name and exercises:
                workouts.append({
                    "name": current_workout_name,
                    "type": current_workout_type,
                    "exercises": exercises,
                })
                exercises = []
                exercise_order = 0
            if current_week and workouts:
                weeks.append({"week_number": current_week, "workouts": workouts})
                workouts = []
            week_match = re.search(r"Week\s*(\d+)", str(a))
            current_week = int(week_match.group(1)) if week_match else 1
            current_workout_name = None
            day_counter = 0
            continue

        # Rest day
        if a and "REST" in str(a).upper():
            continue

        # Workout name (FULL BODY 1:, FULL BODY 2:, etc.)
        if a and ("FULL BODY" in str(a).upper() or "BODY" in str(a).upper()):
            if current_workout_name and exercises:
                workouts.append({
                    "name": current_workout_name,
                    "type": current_workout_type,
                    "exercises": exercises,
                })
                exercises = []
                exercise_order = 0
            day_counter += 1
            current_workout_name = a.rstrip(":")
            current_workout_type = "full"
            # If the same row also has an exercise in col B
            if b and d is not None:
                exercise_order += 1
                exercises.append({
                    "order": exercise_order,
                    "name": b,
                    "warmup_sets": c or "0",
                    "working_sets": int(float(d)) if d else 1,
                    "reps": e,
                    "rpe": g,
                    "rest": h,
                    "notes": k,
                    "substitutions": [],
                })
            continue

        # Exercise row
        if b and d is not None:
            exercise_order += 1
            exercises.append({
                "order": exercise_order,
                "name": b,
                "warmup_sets": c or "0",
                "working_sets": int(float(d)) if d else 1,
                "reps": e,
                "rpe": g,
                "rest": h,
                "notes": k,
                "substitutions": [],
            })

    # Save remaining
    if current_workout_name and exercises:
        workouts.append({
            "name": current_workout_name,
            "type": current_workout_type,
            "exercises": exercises,
        })
    if current_week and workouts:
        weeks.append({"week_number": current_week, "workouts": workouts})
    elif workouts:
        weeks.append({"week_number": 1, "workouts": workouts})

    return weeks


def process_ppl_file(filename, program_name, slug, frequency):
    """Process an Ultimate PPL Excel file."""
    filepath = SOURCE_DIR / "Ultimate PPL 4x 5x 6x" / filename
    wb = openpyxl.load_workbook(str(filepath), data_only=True)

    program = {
        "name": program_name,
        "slug": slug,
        "frequency": frequency,
        "description": f"Jeff Nippard's Ultimate Push Pull Legs System - {frequency}x/week",
        "source_file": filename,
        "phases": [],
    }

    for sheet_name in wb.sheetnames:
        ws = wb[sheet_name]
        # Extract phase info from sheet title or first rows
        phase_num = len(program["phases"]) + 1
        phase_name = sheet_name

        weeks = parse_ppl_sheet(ws, program_name, frequency)

        # Assign day numbers to workouts within each week
        for week in weeks:
            for day_idx, workout in enumerate(week["workouts"]):
                workout["day_number"] = day_idx + 1

        program["phases"].append({
            "phase_number": phase_num,
            "name": phase_name,
            "description": None,
            "weeks": weeks,
        })

    return program


def process_pb_file(filename, subdir, program_name, slug, frequency):
    """Process a Powerbuilding Excel file."""
    filepath = SOURCE_DIR / subdir / filename
    wb = openpyxl.load_workbook(str(filepath), data_only=True)

    program = {
        "name": program_name,
        "slug": slug,
        "frequency": frequency,
        "description": f"Jeff Nippard's {program_name}",
        "source_file": filename,
        "phases": [],
    }

    for sheet_name in wb.sheetnames:
        ws = wb[sheet_name]
        phase_num = len(program["phases"]) + 1

        weeks = parse_pb_sheet(ws, program_name, frequency)

        for week in weeks:
            for day_idx, workout in enumerate(week["workouts"]):
                workout["day_number"] = day_idx + 1

        program["phases"].append({
            "phase_number": phase_num,
            "name": sheet_name,
            "description": None,
            "weeks": weeks,
        })

    return program


def main():
    programs = []

    # Ultimate PPL
    for filename, name, slug, freq in [
        ("The_Ultimate_Push_Pull_Legs_System_-_4x.xlsx", "Ultimate PPL 4x", "ultimate-ppl-4x", 4),
        ("The_Ultimate_Push_Pull_Legs_System_-_5x.xlsx", "Ultimate PPL 5x", "ultimate-ppl-5x", 5),
        ("The_Ultimate_Push_Pull_Legs_System_-_6x.xlsx", "Ultimate PPL 6x", "ultimate-ppl-6x", 6),
        ("Edited PPL 5x.xlsx", "Ultimate PPL 5x (Edited)", "ultimate-ppl-5x-edited", 5),
    ]:
        print(f"Processing {name}...")
        try:
            program = process_ppl_file(filename, name, slug, freq)
            programs.append(program)
            output_path = OUTPUT_DIR / f"{slug}.json"
            with open(output_path, "w") as f:
                json.dump(program, f, indent=2)
            print(f"  → {output_path} ({sum(len(w['workouts']) for p in program['phases'] for w in p['weeks'])} workouts)")
        except Exception as ex:
            print(f"  ERROR: {ex}")

    # Powerbuilding 2.0
    for filename, name, slug, freq in [
        ("POWERBUILDING 2.0 SPREADSHEET 4x.xlsx", "Powerbuilding 2.0 4x", "powerbuilding-2-4x", 4),
        ("POWERBUILDING 2.0 SPREADSHEET 5-6x.xlsx", "Powerbuilding 2.0 5-6x", "powerbuilding-2-5-6x", 5),
    ]:
        print(f"Processing {name}...")
        try:
            program = process_pb_file(filename, "Jeff Nippard - Powerbuilding Version 2", name, slug, freq)
            programs.append(program)
            output_path = OUTPUT_DIR / f"{slug}.json"
            with open(output_path, "w") as f:
                json.dump(program, f, indent=2)
            print(f"  → {output_path}")
        except Exception as ex:
            print(f"  ERROR: {ex}")

    # Powerbuilding 3.0
    print("Processing Powerbuilding 3.0 5x...")
    try:
        program = process_pb_file(
            "PowerBuilding 3.0.xlsx",
            "Powerbuilding 3.0",
            "Powerbuilding 3.0 5x",
            "powerbuilding-3-5x",
            5,
        )
        programs.append(program)
        output_path = OUTPUT_DIR / "powerbuilding-3-5x.json"
        with open(output_path, "w") as f:
            json.dump(program, f, indent=2)
        print(f"  → {output_path}")
    except Exception as ex:
        print(f"  ERROR: {ex}")

    print(f"\nDone! Extracted {len(programs)} programs.")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run extraction**

Run:
```bash
cd /Users/austinmoore/ppl_workout_app
python3 scripts/extract-programs.py
```
Expected: JSON files created in `scripts/seed-data/` for each program.

- [ ] **Step 3: Verify extracted data looks correct**

Run:
```bash
python3 -c "
import json
for f in ['ultimate-ppl-5x', 'powerbuilding-2-4x', 'powerbuilding-3-5x']:
    with open(f'scripts/seed-data/{f}.json') as fh:
        data = json.load(fh)
    phases = len(data['phases'])
    total_workouts = sum(len(w['workouts']) for p in data['phases'] for w in p['weeks'])
    total_exercises = sum(len(ex['exercises']) for p in data['phases'] for w in p['weeks'] for ex in w['workouts'])
    print(f'{f}: {phases} phases, {total_workouts} workouts, {total_exercises} exercises')
"
```
Expected: Non-zero counts for all programs.

- [ ] **Step 4: Commit**

```bash
git add scripts/
git commit -m "data: extract all Excel programs to JSON seed files"
```

---

### Task 5: Seed database from extracted JSON

**Files:**
- Create: `scripts/seed.ts`

- [ ] **Step 1: Install tsx for running TypeScript scripts**

Run:
```bash
npm install -D tsx
```

- [ ] **Step 2: Create seed script**

Create `scripts/seed.ts`:
```ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";
import * as fs from "fs";
import * as path from "path";

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
  warmup_sets: string;
  working_sets: number;
  reps: string | null;
  rpe: string | null;
  rest: string | null;
  notes: string | null;
  substitutions: SubstitutionData[];
}

interface WorkoutData {
  name: string;
  type: string;
  day_number: number;
  exercises: ExerciseData[];
}

interface WeekData {
  week_number: number;
  workouts: WorkoutData[];
}

interface PhaseData {
  phase_number: number;
  name: string;
  description: string | null;
  weeks: WeekData[];
}

interface ProgramData {
  name: string;
  slug: string;
  frequency: number;
  description: string;
  source_file: string;
  phases: PhaseData[];
}

async function seedProgram(programData: ProgramData) {
  console.log(`Seeding: ${programData.name}`);

  // Insert program
  const [program] = await db
    .insert(schema.programs)
    .values({
      name: programData.name,
      slug: programData.slug,
      frequency: programData.frequency,
      description: programData.description,
      sourceFile: programData.source_file,
    })
    .returning();

  for (const phaseData of programData.phases) {
    const [phase] = await db
      .insert(schema.phases)
      .values({
        programId: program.id,
        phaseNumber: phaseData.phase_number,
        name: phaseData.name,
        description: phaseData.description,
      })
      .returning();

    for (const weekData of phaseData.weeks) {
      const [week] = await db
        .insert(schema.weeks)
        .values({
          phaseId: phase.id,
          weekNumber: weekData.week_number,
        })
        .returning();

      for (const workoutData of weekData.workouts) {
        const [workout] = await db
          .insert(schema.workoutTemplates)
          .values({
            weekId: week.id,
            dayNumber: workoutData.day_number,
            name: workoutData.name,
            type: workoutData.type,
          })
          .returning();

        for (const exerciseData of workoutData.exercises) {
          const [exercise] = await db
            .insert(schema.exerciseTemplates)
            .values({
              workoutTemplateId: workout.id,
              order: exerciseData.order,
              name: exerciseData.name,
              warmupSets: exerciseData.warmup_sets,
              workingSets: exerciseData.working_sets,
              reps: exerciseData.reps,
              rpe: exerciseData.rpe,
              rest: exerciseData.rest,
              notes: exerciseData.notes,
            })
            .returning();

          for (const sub of exerciseData.substitutions) {
            await db.insert(schema.substitutions).values({
              exerciseTemplateId: exercise.id,
              optionNumber: sub.option_number,
              name: sub.name,
              notes: sub.notes || null,
            });
          }
        }
      }
    }
  }

  console.log(`  ✓ Seeded ${programData.name}`);
}

async function main() {
  const seedDir = path.join(__dirname, "seed-data");
  const files = fs.readdirSync(seedDir).filter((f) => f.endsWith(".json"));

  console.log(`Found ${files.length} program files to seed.\n`);

  for (const file of files) {
    const data: ProgramData = JSON.parse(
      fs.readFileSync(path.join(seedDir, file), "utf-8")
    );
    await seedProgram(data);
  }

  // Create default user profile
  const programs = await db.select().from(schema.programs);
  const firstProgram = programs[0];

  if (firstProgram) {
    const phases = await db
      .select()
      .from(schema.phases)
      .where(
        require("drizzle-orm").eq(
          schema.phases.programId,
          firstProgram.id
        )
      );
    const firstPhase = phases[0];

    await db.insert(schema.userProfile).values({
      units: "lbs",
      currentProgramId: firstProgram.id,
      currentPhaseId: firstPhase?.id || null,
      currentWeekNumber: 1,
      currentDayNumber: 1,
    });
    console.log(`\n✓ Created user profile (default program: ${firstProgram.name})`);
  }

  console.log("\nDone!");
}

main().catch(console.error);
```

- [ ] **Step 3: Add seed script to package.json**

Add to `package.json` scripts:
```json
"db:seed": "tsx scripts/seed.ts",
"db:migrate": "drizzle-kit migrate",
"db:generate": "drizzle-kit generate"
```

- [ ] **Step 4: Run the seed**

Run:
```bash
npm run db:seed
```
Expected: All programs seeded, user profile created.

- [ ] **Step 5: Verify data in DB**

Run:
```bash
npx tsx -e "
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
sql('SELECT name, frequency FROM programs ORDER BY id').then(r => console.table(r));
sql('SELECT COUNT(*) as count FROM exercise_templates').then(r => console.log('Total exercises:', r[0].count));
"
```
Expected: All programs listed, exercise count > 0.

- [ ] **Step 6: Commit**

```bash
git add scripts/seed.ts package.json
git commit -m "data: seed script to load all programs into Neon"
```

---

### Task 6: Database query functions

**Files:**
- Create: `src/db/queries.ts`

- [ ] **Step 1: Create reusable queries**

Create `src/db/queries.ts`:
```ts
import { db } from "./index";
import { eq } from "drizzle-orm";
import {
  userProfile,
  programs,
  phases,
  weeks,
  workoutTemplates,
  exerciseTemplates,
  substitutions,
} from "./schema";

export async function getUserProfile() {
  const rows = await db.select().from(userProfile).limit(1);
  return rows[0] || null;
}

export async function getCurrentWorkout() {
  const profile = await getUserProfile();
  if (!profile?.currentProgramId || !profile.currentPhaseId) return null;

  // Get the current week for this phase
  const currentWeeks = await db
    .select()
    .from(weeks)
    .where(eq(weeks.phaseId, profile.currentPhaseId));

  const currentWeek = currentWeeks.find(
    (w) => w.weekNumber === profile.currentWeekNumber
  );
  if (!currentWeek) return null;

  // Get the workout for this day
  const workouts = await db
    .select()
    .from(workoutTemplates)
    .where(eq(workoutTemplates.weekId, currentWeek.id))
    .orderBy(workoutTemplates.dayNumber);

  const todayWorkout = workouts.find(
    (w) => w.dayNumber === profile.currentDayNumber
  );
  if (!todayWorkout) return null;

  // Get exercises with substitutions
  const exercisesRaw = await db
    .select()
    .from(exerciseTemplates)
    .where(eq(exerciseTemplates.workoutTemplateId, todayWorkout.id))
    .orderBy(exerciseTemplates.order);

  const exercisesWithSubs = await Promise.all(
    exercisesRaw.map(async (ex) => {
      const subs = await db
        .select()
        .from(substitutions)
        .where(eq(substitutions.exerciseTemplateId, ex.id))
        .orderBy(substitutions.optionNumber);
      return { ...ex, substitutions: subs };
    })
  );

  // Get program and phase info
  const [program] = await db
    .select()
    .from(programs)
    .where(eq(programs.id, profile.currentProgramId));

  const [phase] = await db
    .select()
    .from(phases)
    .where(eq(phases.id, profile.currentPhaseId));

  return {
    profile,
    program,
    phase,
    week: currentWeek,
    workout: todayWorkout,
    exercises: exercisesWithSubs,
    totalDaysInWeek: workouts.length,
  };
}

export async function advanceDay() {
  const profile = await getUserProfile();
  if (!profile) return;

  const data = await getCurrentWorkout();
  if (!data) return;

  let nextDay = profile.currentDayNumber! + 1;

  if (nextDay > data.totalDaysInWeek) {
    // Advance to next week
    nextDay = 1;
    const nextWeekNumber = profile.currentWeekNumber! + 1;

    // Check if next week exists in current phase
    const weeksInPhase = await db
      .select()
      .from(weeks)
      .where(eq(weeks.phaseId, profile.currentPhaseId!));

    const nextWeek = weeksInPhase.find(
      (w) => w.weekNumber === nextWeekNumber
    );

    if (nextWeek) {
      await db
        .update(userProfile)
        .set({
          currentWeekNumber: nextWeekNumber,
          currentDayNumber: 1,
        })
        .where(eq(userProfile.id, profile.id));
    } else {
      // Advance to next phase
      const phasesInProgram = await db
        .select()
        .from(phases)
        .where(eq(phases.programId, profile.currentProgramId!))
        .orderBy(phases.phaseNumber);

      const currentPhaseIdx = phasesInProgram.findIndex(
        (p) => p.id === profile.currentPhaseId
      );
      const nextPhase = phasesInProgram[currentPhaseIdx + 1];

      if (nextPhase) {
        await db
          .update(userProfile)
          .set({
            currentPhaseId: nextPhase.id,
            currentWeekNumber: 1,
            currentDayNumber: 1,
          })
          .where(eq(userProfile.id, profile.id));
      } else {
        // Program complete — stay on last day
        // (Plan 3 will handle program completion UI)
      }
    }
  } else {
    await db
      .update(userProfile)
      .set({ currentDayNumber: nextDay })
      .where(eq(userProfile.id, profile.id));
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/db/queries.ts
git commit -m "feat: database query functions for current workout and day advancement"
```

---

### Task 7: Bottom navigation component

**Files:**
- Create: `src/components/bottom-nav.tsx`

- [ ] **Step 1: Create bottom nav**

Create `src/components/bottom-nav.tsx`:
```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CalendarDays, MessageSquare, TrendingUp } from "lucide-react";

const tabs = [
  { href: "/", label: "Today", icon: CalendarDays },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/progress", label: "Progress", icon: TrendingUp },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors",
                isActive ? "text-zinc-50" : "text-zinc-500"
              )}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Install lucide-react**

Run:
```bash
npm install lucide-react
```

- [ ] **Step 3: Add bottom nav to root layout**

Update `src/app/layout.tsx` to include the BottomNav:
```tsx
import { BottomNav } from "@/components/bottom-nav";

// ... existing code ...

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased bg-zinc-950 text-zinc-50`}>
        <main className="mx-auto max-w-md pb-20">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/bottom-nav.tsx src/app/layout.tsx
git commit -m "feat: bottom navigation bar with Today, Chat, Progress tabs"
```

---

### Task 8: Today screen

**Files:**
- Create: `src/components/workout-card.tsx`, `src/components/exercise-list.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create exercise list component**

Create `src/components/exercise-list.tsx`:
```tsx
import { cn } from "@/lib/utils";

interface Exercise {
  id: number;
  name: string;
  warmupSets: string | null;
  workingSets: number;
  reps: string | null;
  rpe: string | null;
  rest: string | null;
}

export function ExerciseList({ exercises }: { exercises: Exercise[] }) {
  return (
    <div className="space-y-2">
      {exercises.map((ex, idx) => (
        <div
          key={ex.id}
          className="flex items-baseline justify-between gap-2 text-sm"
        >
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="font-mono text-xs text-zinc-500 w-5 shrink-0">
              {idx + 1}
            </span>
            <span className="text-zinc-200 truncate">{ex.name}</span>
          </div>
          <span className="font-mono text-xs text-zinc-400 shrink-0">
            {ex.workingSets}×{ex.reps || "?"}
          </span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create workout card component**

Create `src/components/workout-card.tsx`:
```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExerciseList } from "./exercise-list";
import Link from "next/link";

interface WorkoutCardProps {
  workout: {
    name: string;
    type: string;
  };
  exercises: Array<{
    id: number;
    name: string;
    warmupSets: string | null;
    workingSets: number;
    reps: string | null;
    rpe: string | null;
    rest: string | null;
  }>;
  totalDaysInWeek: number;
  currentDay: number;
}

const typeColors: Record<string, string> = {
  push: "bg-red-500/10 text-red-400 border-red-500/20",
  pull: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  legs: "bg-green-500/10 text-green-400 border-green-500/20",
  upper: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  lower: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  full: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

export function WorkoutCard({
  workout,
  exercises,
  totalDaysInWeek,
  currentDay,
}: WorkoutCardProps) {
  const estimatedMinutes = exercises.length * 7; // ~7 min per exercise

  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{workout.name}</CardTitle>
          <Badge
            variant="outline"
            className={typeColors[workout.type] || typeColors.full}
          >
            {workout.type}
          </Badge>
        </div>
        <CardDescription>
          {exercises.length} exercises · ~{estimatedMinutes} min · Day{" "}
          {currentDay}/{totalDaysInWeek}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ExerciseList exercises={exercises} />
        <Link
          href="/chat"
          className="block w-full rounded-lg bg-zinc-50 py-3 text-center text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200"
        >
          Start Workout
        </Link>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Build the Today page**

Replace `src/app/page.tsx`:
```tsx
import { getCurrentWorkout } from "@/db/queries";
import { WorkoutCard } from "@/components/workout-card";
import Link from "next/link";

export default async function TodayPage() {
  const data = await getCurrentWorkout();

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 pt-20">
        <h1 className="text-xl font-semibold">No Program Selected</h1>
        <p className="text-sm text-zinc-400 text-center">
          Choose a program to get started.
        </p>
        <Link
          href="/programs"
          className="rounded-lg bg-zinc-50 px-6 py-3 text-sm font-medium text-zinc-950"
        >
          Browse Programs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 pt-6">
      {/* Program context */}
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">{data.program.name}</h1>
        <p className="text-sm text-zinc-400">
          {data.phase.name} · Week {data.week.weekNumber}
        </p>
      </div>

      {/* Today's workout */}
      <WorkoutCard
        workout={data.workout}
        exercises={data.exercises}
        totalDaysInWeek={data.totalDaysInWeek}
        currentDay={data.profile.currentDayNumber!}
      />
    </div>
  );
}
```

- [ ] **Step 4: Verify the page renders**

Run:
```bash
npm run dev
```
Open localhost:3000. Expected: Today screen shows current program, phase, week, and workout card with exercise list and "Start Workout" button.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/components/workout-card.tsx src/components/exercise-list.tsx
git commit -m "feat: Today screen with workout card and exercise list"
```

---

### Task 9: Deploy to Vercel

- [ ] **Step 1: Create .gitignore entries**

Ensure `.gitignore` includes:
```
.env*.local
node_modules/
.next/
```

- [ ] **Step 2: Deploy**

Run:
```bash
vercel deploy
```
Expected: Preview deployment URL returned.

- [ ] **Step 3: Promote to production**

Run:
```bash
vercel --prod
```

- [ ] **Step 4: Verify production**

Open the production URL. Expected: Today screen renders with workout data.

- [ ] **Step 5: Commit any deployment config**

```bash
git add -A
git commit -m "deploy: initial Vercel deployment"
```

---

## Summary

After completing this plan, you have:
- A Next.js 16 app with shadcn/ui dark mode, Geist fonts, bottom navigation
- Full Drizzle schema in Neon Postgres
- All Excel-based programs extracted and seeded (Ultimate PPL 4x/5x/6x, PB 2.0 4x/5-6x, PB 3.0 5x)
- A working Today screen showing the user's current workout
- Deployed to Vercel

**Next plans:**
- **Plan 2 (Chat AI):** Conversational workout logger with AI SDK + AI Gateway
- **Plan 3 (Progress & Programs):** Analytics, workout history, program browser
