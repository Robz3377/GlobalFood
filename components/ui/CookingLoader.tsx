import { CookingPot } from "lucide-react";

export function CookingLoader({ message = "On prépare ça…" }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-bone/80 backdrop-blur-sm pointer-events-none">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Steam dots */}
          <span
            className="absolute -top-3 left-2 h-1.5 w-1.5 rounded-full bg-ink-soft/50 animate-[steam_1.4s_ease-out_infinite]"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="absolute -top-3 left-5 h-1 w-1 rounded-full bg-ink-soft/50 animate-[steam_1.4s_ease-out_infinite]"
            style={{ animationDelay: "350ms" }}
          />
          <span
            className="absolute -top-3 left-8 h-1.5 w-1.5 rounded-full bg-ink-soft/50 animate-[steam_1.4s_ease-out_infinite]"
            style={{ animationDelay: "700ms" }}
          />
          <CookingPot
            className="h-12 w-12 text-terracotta animate-[wiggle_1.4s_ease-in-out_infinite]"
            strokeWidth={1.75}
          />
        </div>
        <p className="font-serif text-sm text-ink-soft">{message}</p>
      </div>
    </div>
  );
}
