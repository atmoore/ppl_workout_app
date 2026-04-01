"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowUp } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const chips = ["done", "skip", "what's next"];

  return (
    <div className="border-t border-zinc-800 bg-zinc-950 px-4 pb-6 pt-3">
      <div className="flex gap-2 mb-3 overflow-x-auto">
        {chips.map((chip) => (
          <button key={chip} onClick={() => onSend(chip)} disabled={disabled}
            className="shrink-0 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-800 disabled:opacity-50">
            {chip}
          </button>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); if (input.trim() && !disabled) { onSend(input.trim()); setInput(""); } }}
        className="flex items-center gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="bench 225 5 5 4..."
          disabled={disabled}
          className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none disabled:opacity-50" />
        <button type="submit" disabled={disabled || !input.trim()}
          className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
            input.trim() && !disabled ? "bg-zinc-100 text-zinc-900" : "bg-zinc-800 text-zinc-500")}>
          <ArrowUp className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
