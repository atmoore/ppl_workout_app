"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import { switchProgramAction } from "@/app/programs/actions";

interface Program {
  id: number;
  name: string;
  slug: string;
  frequency: number | null;
  description: string | null;
  phases: number;
  totalWorkouts: number;
  totalExercises: number;
  phaseNames: string[];
}

interface ProgramListProps {
  programs: Program[];
  currentProgramId: number | null;
}

function categorize(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("ultimate ppl")) return "Ultimate PPL";
  if (lower.includes("powerbuilding")) return "Powerbuilding";
  if (lower.includes("essentials")) return "Essentials";
  return "Specialization";
}

export function ProgramList({ programs, currentProgramId }: ProgramListProps) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [switching, setSwitching] = useState<number | null>(null);
  const [switched, setSwitched] = useState<number | null>(null);
  const router = useRouter();

  const grouped = programs.reduce((acc, p) => {
    const cat = categorize(p.name);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {} as Record<string, Program[]>);

  const categoryOrder = ["Ultimate PPL", "Powerbuilding", "Essentials", "Specialization"];
  const sortedCategories = categoryOrder.filter(c => grouped[c]);

  async function handleSwitch(programId: number) {
    setSwitching(programId);
    await switchProgramAction(programId);
    setSwitched(programId);
    setSwitching(null);
    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 800);
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
            const isExpanded = expanded === program.id;
            const isSwitching = switching === program.id;
            const justSwitched = switched === program.id;

            return (
              <Card
                key={program.id}
                className={`border-zinc-800 bg-zinc-900 transition-all ${isCurrent ? "border-zinc-600" : ""} ${justSwitched ? "border-green-700 bg-green-950/30" : ""}`}
              >
                <button
                  onClick={() => setExpanded(isExpanded ? null : program.id)}
                  className="w-full text-left"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-zinc-50 text-base">
                        {program.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 shrink-0">
                        {program.frequency && (
                          <Badge variant="outline" className="bg-zinc-800/50 text-zinc-300 border-zinc-700 text-xs">
                            {program.frequency}x/wk
                          </Badge>
                        )}
                        {isCurrent && (
                          <Badge className="bg-zinc-100 text-zinc-900 text-xs">Current</Badge>
                        )}
                        {justSwitched && (
                          <Badge className="bg-green-600 text-white text-xs">
                            <Check className="h-3 w-3 mr-1" />Switched!
                          </Badge>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-zinc-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-zinc-500" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </button>

                {isExpanded && (
                  <CardContent className="pt-0 flex flex-col gap-4">
                    {program.description && (
                      <p className="text-xs text-zinc-500">{program.description}</p>
                    )}

                    {/* Stats */}
                    <div className="flex gap-4 text-xs">
                      <div className="flex flex-col">
                        <span className="font-mono text-zinc-200">{program.phases}</span>
                        <span className="text-zinc-500">phases</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-mono text-zinc-200">{program.totalWorkouts}</span>
                        <span className="text-zinc-500">workouts</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-mono text-zinc-200">{program.totalExercises}</span>
                        <span className="text-zinc-500">exercises</span>
                      </div>
                    </div>

                    {/* Phase names */}
                    {program.phaseNames.length > 0 && (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-zinc-500">Phases:</span>
                        {program.phaseNames.map((name, i) => (
                          <span key={i} className="text-xs text-zinc-300 pl-2">
                            {i + 1}. {name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action button */}
                    {!isCurrent && !justSwitched && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSwitch(program.id); }}
                        disabled={isSwitching || switching !== null}
                        className="w-full rounded-xl bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-950 active:bg-zinc-300 active:scale-[0.98] disabled:opacity-50"
                      >
                        {isSwitching ? "Switching..." : "Start this program"}
                      </button>
                    )}
                    {isCurrent && (
                      <p className="text-xs text-zinc-500 text-center py-1">This is your current program</p>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
}
