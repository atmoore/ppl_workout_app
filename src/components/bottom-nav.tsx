"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, MessageSquare, TrendingUp, Dumbbell } from "lucide-react";

const tabs = [
  { href: "/", label: "Today", icon: CalendarDays },
  { href: "/programs", label: "Programs", icon: Dumbbell },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/progress", label: "Progress", icon: TrendingUp },
];

export function BottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/chat")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md safe-bottom">
      <div className="mx-auto flex max-w-md items-stretch">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-4 min-h-[56px] text-xs font-medium transition-colors active:bg-zinc-800/50 ${
                isActive ? "text-zinc-50" : "text-zinc-500"
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
