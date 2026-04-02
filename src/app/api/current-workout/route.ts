import { getCurrentWorkout } from "@/db/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getCurrentWorkout();
  if (!data) return Response.json({ name: "Workout" });
  return Response.json({ name: data.workout.name ?? "Workout" });
}
