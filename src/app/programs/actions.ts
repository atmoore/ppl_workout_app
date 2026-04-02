"use server";

import { switchProgram } from "@/db/queries";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { workoutSessions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function switchProgramAction(programId: number) {
  // Mark any active sessions as skipped before switching
  await db
    .update(workoutSessions)
    .set({ status: "skipped" })
    .where(eq(workoutSessions.status, "active"));

  await switchProgram(programId);
  revalidatePath("/");
  revalidatePath("/programs");
}
