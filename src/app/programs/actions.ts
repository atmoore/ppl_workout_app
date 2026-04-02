"use server";

import { switchProgram } from "@/db/queries";
import { revalidatePath } from "next/cache";

export async function switchProgramAction(programId: number) {
  await switchProgram(programId);
  revalidatePath("/");
  revalidatePath("/programs");
}
