import React from "react";
import { cn } from "../../lib/utils";

function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "border-transparent bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30",
    secondary: "border-transparent bg-zinc-800 text-zinc-300 hover:bg-zinc-700",
    destructive: "border-transparent bg-red-900/30 text-red-400 hover:bg-red-900/50",
    outline: "text-zinc-400 border-zinc-700",
    success: "border-transparent bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
