import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const typeColors: Record<string, string> = {
  push: "bg-red-900/50 text-red-300 border-red-800",
  pull: "bg-blue-900/50 text-blue-300 border-blue-800",
  legs: "bg-green-900/50 text-green-300 border-green-800",
  upper: "bg-purple-900/50 text-purple-300 border-purple-800",
  lower: "bg-amber-900/50 text-amber-300 border-amber-800",
  full: "bg-zinc-800/50 text-zinc-300 border-zinc-700",
};

interface Exercise {
  name: string;
  workingSets: number | null;
  reps: string | null;
  rpe: string | null;
}

interface WorkoutPreviewProps {
  name: string;
  type: string;
  exercises: Exercise[];
  isFuture: boolean;
}

export function WorkoutPreview({ name, type, exercises, isFuture }: WorkoutPreviewProps) {
  const badgeClass = typeColors[type?.toLowerCase() ?? "full"] ?? typeColors.full;
  const estimatedMinutes = exercises.length * 7;

  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-zinc-50 text-lg">{name ?? "Workout"}</CardTitle>
          <Badge variant="outline" className={`capitalize text-xs ${badgeClass}`}>
            {type}
          </Badge>
        </div>
        <CardDescription className="text-zinc-400 text-sm">
          {exercises.length} exercises · ~{estimatedMinutes} min
          {isFuture && " · Coming up"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {exercises.map((ex, idx) => (
            <div key={idx} className="flex items-baseline justify-between gap-2 text-sm">
              <div className="flex items-baseline gap-2 min-w-0">
                <span className="font-mono text-xs text-zinc-500 w-5 shrink-0">{idx + 1}</span>
                <span className="text-zinc-200 truncate">{ex.name}</span>
              </div>
              <span className="font-mono text-xs text-zinc-400 shrink-0">
                {ex.workingSets}×{ex.reps || "?"}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
