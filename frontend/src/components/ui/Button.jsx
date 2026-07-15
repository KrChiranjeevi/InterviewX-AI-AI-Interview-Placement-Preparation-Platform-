import React from "react";
import { cn } from "../../lib/utils";

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? "span" : "button";
    
    const variants = {
      default: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20",
      secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700/50",
      outline: "border border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white",
      ghost: "text-zinc-400 hover:bg-zinc-800/50 hover:text-white",
      danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3 text-xs",
      lg: "h-11 rounded-xl px-8",
      icon: "h-10 w-10",
    };

    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
