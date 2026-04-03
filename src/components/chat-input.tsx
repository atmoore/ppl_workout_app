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
  const [showHelp, setShowHelp] = useState(true);
  const chips = ["done", "skip exercise", "what's next", "help"];

  return (
    <div className="border-t border-zinc-800 bg-zinc-950 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
      {/* Format help hint — dismissible */}
      {showHelp && (
        <div className="mb-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 px-3 py-2 flex items-start justify-between gap-2">
          <p className="text-xs text-zinc-400">
            Type: <span className="text-zinc-200 font-mono">bench 225 5 5 4</span>
            <span className="text-zinc-500"> = exercise, weight, reps per set</span>
          </p>
          <button
            onClick={() => setShowHelp(false)}
            className="text-xs text-zinc-600 shrink-0 px-3 py-2 rounded-lg active:bg-zinc-700/50"
          >
            dismiss
          </button>
        </div>
      )}
      {/* Quick chips */}
      <div className="flex gap-3 mb-3 overflow-x-auto scrollbar-hide">
        {chips.map((chip) => (
          <button
            key={chip}
            onClick={() => onSend(chip)}
            disabled={disabled}
            className="shrink-0 rounded-full border border-zinc-700 bg-zinc-900 px-5 py-2.5 min-h-[44px] text-sm text-zinc-300 active:bg-zinc-700 disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>
      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim() && !disabled) {
            onSend(input.trim());
            setInput("");
          }
        }}
        className="flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="bench 225 5 5 4..."
          disabled={disabled}
          enterKeyHint="send"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-base text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors active:scale-95",
            input.trim() && !disabled
              ? "bg-zinc-100 text-zinc-900"
              : "bg-zinc-800 text-zinc-500"
          )}
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
