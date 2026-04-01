# PPL Workout App — Overhaul Design Spec

**Date:** 2026-03-31
**Status:** Approved

## Overview

Overhaul of the existing vanilla JS PPL workout tracker into a modern, AI-powered workout companion. The app serves all Jeff Nippard programs through a conversational interface — you tell it what you did, it logs structured data, compares against your history, and coaches you.

Single user (Austin). No auth. Mobile-first PWA deployed on Vercel.

## Core Experience

1. Open the app → see today's prescribed workout
2. Tap "Start Workout" → opens a chat interface
3. Message what you did in natural language (e.g., "bench 225 5 5 4")
4. AI parses input, matches to the program's exercises, logs structured data, and provides coaching context (comparison to history, RPE feedback, progression suggestions)
5. Say "done" → session summary with trends

## Programs (All Included)

All programs extracted from PDF/Excel source files at `/Users/austinmoore/projects/Jeff Nippard/`:

### Full Programs (with Excel spreadsheet data)
- Ultimate PPL System — 4x, 5x, 6x per week (3 phases each)
- Powerbuilding 1.0 — 4x, 5-6x
- Powerbuilding 2.0 — 4x, 5-6x
- Powerbuilding 3.0 — 5x
- Essentials (Minimalist) — 4x, 5x

### Specialization Programs (PDF-sourced)
- Squat Specialization
- Bench Press
- Chest Hypertrophy
- Back Hypertrophy
- Arm Hypertrophy
- Forearm Hypertrophy
- Neck and Trap Guide
- Glute Hypertrophy

### Women's Programs (Stephanie Buttermore)
- Foundation, Optimization, Specialization, At-Home

### Reference Materials (coaching notes, not standalone programs)
- 10 Tips for Chest Gains
- Favorite Exercise for Each Body Part
- Technique Handbooks

## Screens

### 1. Today (Home)
- Current program name, phase, week
- Today's workout card: name, type, exercise count, estimated duration
- "Start Workout" button → opens Chat
- If today's workout is done: summary card + tomorrow's preview
- Auto-advances day → week → phase. No calendar binding — serves next workout whenever you open it.
- No streaks, no guilt mechanics, no notifications.

### 2. Chat (Active Workout)
- Full-screen conversational interface
- Elapsed timer pinned at top
- AI opens with today's workout summary (exercises, sets, reps, RPE targets)
- User messages in natural language; AI responds with:
  - Parsed/logged data shown as inline structured cards
  - Coaching feedback (comparison to history, RPE notes, progression suggestions)
  - Substitution suggestions when equipment is unavailable
- Quick-action chips: "done", "skip", "what's next"
- "done" → ends session, shows workout summary

### 3. Progress
- **Exercises tab**: per-exercise history, weight/reps/1RM charts for key lifts, trend indicators
- **History tab**: scrollable workout log (date, program, duration, volume). Tap to expand full set log + original chat transcript.
- **Program tab**: visual progress through current program (phase/week), completion history

### 4. Program Browser (accessed from Today screen)
- Browse all available programs
- Preview: structure, phases, frequency, estimated duration
- "Start this program" → sets active, resets to Phase 1 Week 1
- 1RMs and exercise history carry over (tied to exercises, not programs)

## Chat AI Behavior

### Parsing
- Shorthand: "bench 225 5 5 4" → Barbell Bench Press, 225 lbs, sets of 5/5/4
- Exercise matching: "bench" → matches to today's prescribed Barbell Bench Press
- Ambiguous input → AI asks to clarify, never guesses wrong
- "done" / "finished" → ends session

### Coaching Context (per session)
The AI has access to:
- Today's full workout template (exercises, sets, reps, RPE, rest, coaching notes)
- All substitution options for each exercise
- User's exercise history (last 4-6 sessions per exercise)
- User's current 1RMs
- Program-specific coaching notes

### Coaching Feedback
- Compares logged sets against prescribed targets (rep range, RPE)
- Compares against previous sessions (weight up/down, rep trend)
- Suggests staying at weight, increasing, or deloading based on trends
- End-of-session summary with highlights and concerns

### Substitutions
- User says "machine is taken" or "don't have X" → AI looks up substitution options from the exercise template
- Offers 2 alternatives with brief rationale
- Logs the substituted exercise with a reference to what it replaced

### Time Constraints
- User says "only have 30 minutes" → AI trims the workout:
  - Prioritize compounds over isolation (primary > secondary > tertiary)
  - Reduce sets before dropping exercises
  - Show what was cut
- If Essentials program is available, suggest swapping to the equivalent Essentials workout as an alternative to trimming

## Data Model

### Program Data (seeded from Jeff Nippard files)

```
programs
  id, name, slug, frequency, description, source_file

phases
  id, program_id, phase_number, name, description

weeks
  id, phase_id, week_number

workout_templates
  id, week_id, day_number, name, type (push/pull/legs/upper/lower/full)

exercise_templates
  id, workout_template_id, order, name, warmup_sets, working_sets,
  reps, rpe, rest, notes, video_url

substitutions
  id, exercise_template_id, option_number, name, notes
```

### User Data

```
user_profile
  id, units (lbs/kg), current_program_id, current_phase_id,
  current_week_number, current_day_number

exercise_maxes
  id, exercise_name (normalized), weight, estimated_1rm, updated_at

workout_sessions
  id, workout_template_id, date, started_at, completed_at,
  duration_minutes, status (active/completed/skipped), notes

set_logs
  id, session_id, exercise_name, set_number, set_type (warmup/working),
  weight, reps, rpe, completed, substituted_for

chat_messages
  id, session_id, role (user/assistant), content, parsed_data (jsonb),
  created_at
```

### Key Relationships
- `user_profile.current_program_id` drives "what do I do today"
- `exercise_maxes` shared across all programs (exercise-level, not program-level)
- `chat_messages.parsed_data` stores structured extraction for auditability
- `set_logs.substituted_for` tracks when an exercise was swapped

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router, Server Components, Server Actions) |
| UI | shadcn/ui + Tailwind CSS + Geist Sans/Mono |
| Database | Neon Postgres (via Vercel Marketplace) |
| ORM | Drizzle |
| AI | AI SDK v6 + AI Gateway |
| AI Model | `anthropic/claude-sonnet-4.6` via Gateway |
| Hosting | Vercel |
| Offline | PWA service worker (UI shell caches; AI requires network) |

## UI Design

- **Dark mode default** — zinc/neutral palette, single accent color
- **Mobile-first** — designed for phone in the gym, thumb-reachable
- **Bottom nav**: Today | Chat | Progress
- **Geist Sans** for interface text, **Geist Mono** for weights, reps, numbers, timers
- **Chat screen**: AI messages styled distinctly from user. Parsed data rendered as compact structured cards inline. Quick-action chips for common actions.
- **Today screen**: card-based workout preview, prominent start button
- **Progress screen**: tabbed (Exercises / History / Program), charts for key lifts

## Data Extraction Plan

Source: `/Users/austinmoore/projects/Jeff Nippard/`

### Excel Spreadsheets (highest priority — structured data)
- Ultimate PPL 4x, 5x, 6x `.xlsx` files
- Powerbuilding 2.0 4x, 5-6x `.xlsx` files
- Powerbuilding 3.0 `.xlsx` file
- Edited PPL 5x `.xlsx`
- Parse: exercise names, sets, reps, load formulas (%1RM), RPE, rest, substitutions, notes
- Extract per-phase, per-week, per-day structure

### PDFs (secondary — manual extraction or AI-assisted)
- Specialization programs (exercise lists, set/rep schemes)
- Essentials programs
- Women's programs
- Reference materials → coaching notes database

## Not in Scope (v1)

- Authentication / multi-user
- Voice input
- Native mobile app (React Native)
- Body measurements tracking
- Notifications / reminders
- Social / sharing
- Workout timer with rest period alerts

All addable later without architectural changes.
