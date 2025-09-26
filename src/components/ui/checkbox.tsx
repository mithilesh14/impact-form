import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <div className="relative inline-block">
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer absolute opacity-0 w-0 h-0",
        className,
      )}
      {...props}
    />
    <div className={cn(
      "neumorphic-checkbox w-14 h-14 bg-secondary rounded-xl transition-all duration-400 cursor-pointer relative",
      "shadow-[4px_4px_8px_rgba(163,177,198,0.6),-4px_-4px_8px_rgba(255,255,255,0.9)]",
      "hover:shadow-[5px_5px_10px_rgba(163,177,198,0.7),-5px_-5px_10px_rgba(255,255,255,0.95)]",
      "hover:scale-105",
      "peer-checked:bg-gradient-to-br peer-checked:from-secondary peer-checked:to-muted",
      "peer-checked:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,0.9)]",
      "peer-active:scale-95",
      "peer-active:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,0.9)]"
    )}>
      {/* Short arm */}
      <div className={cn(
        "absolute left-3 top-6 w-5 h-1 bg-primary rounded-sm opacity-0 scale-0 transition-all duration-300 ease-[cubic-bezier(0.5,-1,0.5,2)]",
        "peer-checked:opacity-100 peer-checked:scale-100 peer-checked:rotate-45",
        "peer-not-checked:transition-delay-150 peer-checked:transition-delay-0"
      )} style={{ transformOrigin: '0 0' }}></div>
      
      {/* Long arm */}
      <div className={cn(
        "absolute left-5 top-10 w-9 h-1 bg-primary rounded-sm opacity-0 scale-0 transition-all duration-400 ease-[cubic-bezier(0.5,-1,0.5,2)]",
        "peer-checked:opacity-100 peer-checked:scale-100 peer-checked:-rotate-45",
        "peer-checked:transition-delay-150 peer-not-checked:transition-delay-0"
      )} style={{ transformOrigin: '0 0' }}></div>
    </div>
  </div>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
