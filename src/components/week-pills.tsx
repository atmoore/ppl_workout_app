"use client";

import { cn } from "@/lib/utils";

interface DayInfo {
  dayNumber: number;
  name: string;
  type: string;
}

interface WeekPillsProps {
  days: DayInfo[];
  currentDay: number;
  selectedDay: number;
  onSelectDay: (day: number) => void;
}

const typeAbbreviation: Record<string, string> = {
  push: "Push",
  pull: "Pull",
  legs: "Legs",
  upper: "Upper",
  lower: "Lower",
  full: "Full",
};

export function WeekPills({ days, currentDay, selectedDay, onSelectDay }: WeekPillsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
      {days.map((day) => {
        const isCurrentDay = day.dayNumber === currentDay;
        const isPast = day.dayNumber < currentDay;
        const isSelected = day.dayNumber === selectedDay;

        return (
          <button
            key={day.dayNumber}
            onClick={() => onSelectDay(day.dayNumber)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl px-3 py-2 min-w-[56px] transition-colors",
              isSelected
                ? "bg-zinc-100 text-zinc-900"
                : isPast
                  ? "bg-zinc-800/50 text-zinc-500"
                  : "bg-zinc-800 text-zinc-300",
              !isSelected && "active:bg-zinc-700"
            )}
          >
            <span className="text-[10px] font-medium uppercase tracking-wider opacity-60">
              Day {day.dayNumber}
            </span>
            <span className={cn("text-xs font-semibold", isSelected ? "text-zinc-900" : "")}>
              {typeAbbreviation[day.type] || day.type}
            </span>
            {isCurrentDay && !isSelected && (
              <div className="h-1 w-1 rounded-full bg-zinc-400" />
            )}
            {isCurrentDay && isSelected && (
              <div className="h-1 w-1 rounded-full bg-zinc-900" />
            )}
          </button>
        );
      })}
    </div>
  );
}
