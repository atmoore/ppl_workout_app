"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { switchProgramAction } from "@/app/programs/actions";

interface Program {
  id: number;
  name: string;
  frequency: number | null;
  description: string | null;
}

export function Onboarding({ programs }: { programs: Program[] }) {
  const [selected, setSelected] = useState<Program | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function categorize(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes("ultimate ppl")) return "Ultimate PPL";
    if (lower.includes("powerbuilding")) return "Powerbuilding";
    if (lower.includes("essentials")) return "Essentials";
    return "Specialization";
  }

  const grouped = programs.reduce((acc, p) => {
    const cat = categorize(p.name);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {} as Record<string, Program[]>);

  const categoryOrder = ["Ultimate PPL", "Powerbuilding", "Essentials", "Specialization"];

  async function handleStart() {
    if (!selected) return;
    setLoading(true);
    await switchProgramAction(selected.id);
    router.refresh();
  }

  if (selected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-50 mb-2">Ready to go?</h1>
          <p className="text-sm text-zinc-400">
            Starting <span className="text-zinc-200 font-medium">{selected.name}</span>
            {selected.frequency && ` · ${selected.frequency}x per week`}
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full rounded-xl bg-zinc-50 px-4 py-3.5 text-base font-semibold text-zinc-950 active:bg-zinc-300 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Setting up..." : "Start Training"}
          </button>
          <button
            onClick={() => setSelected(null)}
            disabled={loading}
            className="text-sm text-zinc-500 hover:text-zinc-300 px-4 py-3 rounded-lg active:bg-zinc-800/50 min-h-[44px]"
          >
            Choose a different program
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 pt-8 pb-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-zinc-50 mb-2">Choose Your Program</h1>
        <p className="text-sm text-zinc-400">Pick a program to get started</p>
      </div>
      {categoryOrder.filter(c => grouped[c]).map((category) => (
        <div key={category} className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">{category}</h2>
          {grouped[category].map((program) => (
            <button key={program.id} onClick={() => setSelected(program)} className="text-left w-full">
              <Card className="border-zinc-800 bg-zinc-900 active:bg-zinc-800 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-zinc-50 text-base">{program.name}</CardTitle>
                    {program.frequency && (
                      <Badge variant="outline" className="bg-zinc-800/50 text-zinc-300 border-zinc-700 text-xs">
                        {program.frequency}x/wk
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                {program.description && (
                  <CardContent className="pt-0">
                    <p className="text-xs text-zinc-500 line-clamp-2">{program.description}</p>
                  </CardContent>
                )}
              </Card>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
