import { getExerciseProgressData } from "@/db/queries";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) return Response.json({ data: [] });
  const data = await getExerciseProgressData(name);
  return Response.json({ data });
}
