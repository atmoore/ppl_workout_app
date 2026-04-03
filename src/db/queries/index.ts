// Barrel re-export — all existing `import { ... } from "@/db/queries"` still work

export {
  getUserProfile,
  getCurrentWorkout,
  getWeekWorkouts,
  advanceDay,
  type UserProfile,
  type Program,
  type Phase,
  type Week,
  type WorkoutTemplate,
  type ExerciseTemplate,
  type Substitution,
  type CurrentWorkoutData,
} from "./workouts";

export {
  getAllPrograms,
  getAllProgramsWithDetails,
  switchProgram,
  getEssentialsWorkout,
} from "./programs";

export {
  getTodaySession,
  getActiveSession,
  getLastCompletedSession,
  cleanupAbandonedSessions,
  getWorkoutHistory,
} from "./sessions";

export {
  getExerciseMaxes,
  getExerciseProgressData,
  getTopExercises,
  getWeeklyInsights,
  getExerciseHistory,
} from "./progress";
