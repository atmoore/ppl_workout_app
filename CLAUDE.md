# PPL Workout App

## Project Overview

A workout tracking app built on Jeff Nippard's training programs. Currently a vanilla JS PWA — being overhauled into a modern full-stack application.

## Current State (Pre-Overhaul)

- **Stack**: Vanilla HTML/CSS/JS, no build tools, no frameworks
- **Architecture**: Single-page app with tab navigation, all logic in `app.js` (~2,800 lines)
- **Data**: `workout-data.js` contains Week 1 of the Ultimate PPL system (5 workouts: Push, Pull, Legs, Upper, Lower)
- **Storage**: Browser localStorage only
- **PWA**: Service worker + manifest for offline/installable support
- **Features**: Workout tracking, set logging, progress charts (canvas), measurement tracking, data export/import
- **Database Schema**: `database-schema.sql` exists as a future migration plan (users, templates, sessions, logs)

## Content Library (Jeff Nippard Programs)

Source files at `/Users/austinmoore/projects/Jeff Nippard/`:

### Full Programs (PDF + Excel Spreadsheets)
- **Ultimate PPL System**: 4x, 5x, 6x per week variants, 3 phases each (Base Hypertrophy, Maximum Overload, Supercompensation)
- **Powerbuilding 1.0**: 4x and 5-6x variants
- **Powerbuilding 2.0**: 4x and 5-6x variants with dynamic Excel spreadsheets (auto-calculate loads from 1RM)
- **Powerbuilding 3.0**: 5x variant (996 rows of structured data)
- **Essentials (Minimalist)**: 4x and 5x variants (45-min workouts)

### Specialization Programs (PDFs)
- Squat Specialization
- Bench Press
- Chest Hypertrophy
- Back Hypertrophy
- Arm Hypertrophy
- Forearm Hypertrophy
- Neck and Trap Guide
- Glute Hypertrophy

### Reference Materials
- 10 Tips for Chest Gains
- Favorite Exercise for Each Body Part
- Technique Handbooks (multiple versions)

### Women's Programs (Stephanie Buttermore)
- Foundation, Optimization, Specialization, At-Home

### Structured Data in Spreadsheets
- Exercise names, warm-up/working sets, reps, load (%1RM with formulas), RPE targets, rest periods, substitution options, coaching notes
- Phases with distinct training variables
- User input fields for 1RM and unit preference (lbs/kg)

## Key Training Concepts

- **RPE**: Rate of Perceived Exertion (1-10 scale)
- **1RM**: One-Rep Max — used for percentage-based loading
- **AMRAP**: As Many Reps As Possible
- **Phases**: Programs cycle through hypertrophy, overload, and supercompensation phases
- **Substitutions**: Each exercise has 2 alternative options
- **Progressive Overload**: Systematic increases in weight/reps/volume across weeks

## Data Model (from existing workout-data.js)

```javascript
// Exercise structure
{
  name: "Barbell Bench Press",
  warmupSets: 2,
  workingSets: 3,
  reps: "6-8",
  rpe: "7-8",
  rest: "3-4 min",
  substitutions: ["DB Bench Press", "Machine Chest Press"],
  notes: "Coaching cues here..."
}

// Workout structure
{
  push1: { name: "Push #1", exercises: [...] },
  pull1: { name: "Pull #1", exercises: [...] },
  legs1: { name: "Legs #1", exercises: [...] },
  upper1: { name: "Upper #1", exercises: [...] },
  lower1: { name: "Lower #1", exercises: [...] }
}
```

## Development Notes

- Working directory: `/Users/austinmoore/ppl_workout_app`
- Content source: `/Users/austinmoore/projects/Jeff Nippard/`
- The Excel spreadsheets contain the most structured, integration-ready data (exercises, sets, reps, load formulas, phases)
- The existing `database-schema.sql` outlines a relational model worth referencing during overhaul
- The app currently only has Week 1 data — the full programs span multiple weeks and phases
