import type { ExerciseTemplate, Substitution } from "@/db/queries";

type ExerciseWithSubs = ExerciseTemplate & { substitutions: Substitution[] };

interface ExerciseListProps {
  exercises: ExerciseWithSubs[];
}

export function ExerciseList({ exercises }: ExerciseListProps) {
  return (
    <ul className="flex flex-col gap-3">
      {exercises.map((exercise) => (
        <li key={exercise.id} className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono text-sm text-zinc-500 w-5 shrink-0 text-right">
              {exercise.order}
            </span>
            <span className="text-sm text-zinc-200 truncate">{exercise.name}</span>
          </div>
          <span className="font-mono text-xs text-zinc-400 ml-4 shrink-0">
            {exercise.workingSets ?? "—"}×{exercise.reps ?? "—"}
          </span>
        </li>
      ))}
    </ul>
  );
}
