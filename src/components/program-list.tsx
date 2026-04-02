"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { switchProgramAction } from "@/app/programs/actions";

interface Program {
  id: number;
  name: string;
  slug: string;
  frequency: number | null;
  description: string | null;
}

interface ProgramListProps {
  programs: Program[];
  currentProgramId: number | null;
}

// Group programs by category based on name
function categorize(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("ultimate ppl")) return "Ultimate PPL";
  if (lower.includes("powerbuilding")) return "Powerbuilding";
  if (lower.includes("essentials")) return "Essentials";
  return "Specialization";
}

export function ProgramList({ programs, currentProgramId }: ProgramListProps) {
  const [switching, setSwitching] = useState<number | null>(null);
  const router = useRouter();

  const grouped = programs.reduce((acc, p) => {
    const cat = categorize(p.name);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {} as Record<string, Program[]>);

  // Order categories
  const categoryOrder = ["Ultimate PPL", "Powerbuilding", "Essentials", "Specialization"];
  const sortedCategories = categoryOrder.filter(c => grouped[c]);

  async function handleSwitch(programId: number) {
    setSwitching(programId);
    await switchProgramAction(programId);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {sortedCategories.map((category) => (
        <div key={category} className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
            {category}
          </h2>
          {grouped[category].map((program) => {
            const isCurrent = program.id === currentProgramId;
            const isLoading = switching === program.id;

            return (
              <button
                key={program.id}
                onClick={() => !isCurrent && handleSwitch(program.id)}
                disabled={isCurrent || switching !== null}
                className="text-left w-full disabled:opacity-70"
              >
                <Card className={`border-zinc-800 bg-zinc-900 transition-colors ${!isCurrent && switching === null ? "active:bg-zinc-800" : ""} ${isCurrent ? "border-zinc-600" : ""}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-zinc-50 text-base">
                        {program.name}
                      </CardTitle>
                      <div className="flex gap-2 shrink-0">
                        {program.frequency && (
                          <Badge variant="outline" className="bg-zinc-800/50 text-zinc-300 border-zinc-700 text-xs">
                            {program.frequency}x/wk
                          </Badge>
                        )}
                        {isCurrent && (
                          <Badge className="bg-zinc-100 text-zinc-900 text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {program.description && (
                    <CardContent className="pt-0">
                      <p className="text-xs text-zinc-500 line-clamp-2">
                        {program.description}
                      </p>
                    </CardContent>
                  )}
                  {isLoading && (
                    <CardContent className="pt-0">
                      <p className="text-xs text-zinc-400">Switching...</p>
                    </CardContent>
                  )}
                </Card>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
