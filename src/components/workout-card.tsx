import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExerciseList } from "@/components/exercise-list";
import type { WorkoutTemplate, ExerciseTemplate, Substitution } from "@/db/queries";

type ExerciseWithSubs = ExerciseTemplate & { substitutions: Substitution[] };

const typeColors: Record<string, string> = {
  push: "bg-red-900/50 text-red-300 border-red-800",
  pull: "bg-blue-900/50 text-blue-300 border-blue-800",
  legs: "bg-green-900/50 text-green-300 border-green-800",
  upper: "bg-purple-900/50 text-purple-300 border-purple-800",
  lower: "bg-amber-900/50 text-amber-300 border-amber-800",
  full: "bg-zinc-800/50 text-zinc-300 border-zinc-700",
};

interface WorkoutCardProps {
  workout: WorkoutTemplate;
  exercises: ExerciseWithSubs[];
  dayNumber: number;
  totalDays: number;
}

export function WorkoutCard({
  workout,
  exercises,
  dayNumber,
  totalDays,
}: WorkoutCardProps) {
  const type = workout.type?.toLowerCase() ?? "full";
  const badgeClass = typeColors[type] ?? typeColors.full;
  const estimatedMinutes = exercises.length * 7;

  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-zinc-50 text-lg">
            {workout.name ?? "Workout"}
          </CardTitle>
          <Badge
            variant="outline"
            className={`capitalize text-xs ${badgeClass}`}
          >
            {type}
          </Badge>
        </div>
        <CardDescription className="text-zinc-400 text-sm">
          {exercises.length} exercises · ~{estimatedMinutes} min · Day {dayNumber}/{totalDays}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <ExerciseList exercises={exercises} />
        <Link
          href="/chat"
          className="inline-flex w-full items-center justify-center rounded-lg bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
        >
          Start Workout
        </Link>
      </CardContent>
    </Card>
  );
}
