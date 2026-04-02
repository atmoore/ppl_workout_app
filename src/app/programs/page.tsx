import { getAllPrograms, getUserProfile } from "@/db/queries";
import { ProgramList } from "@/components/program-list";

export const dynamic = "force-dynamic";

export default async function ProgramsPage() {
  const programs = await getAllPrograms();
  const profile = await getUserProfile();

  return (
    <div className="flex flex-col gap-6 px-4 pt-6 pb-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">Programs</h1>
        <p className="text-sm text-zinc-400">
          {programs.length} programs available
        </p>
      </div>
      <ProgramList
        programs={programs.map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          frequency: p.frequency,
          description: p.description,
        }))}
        currentProgramId={profile?.currentProgramId ?? null}
      />
    </div>
  );
}
