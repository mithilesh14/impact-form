import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-flex-start gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-muted text-foreground hover:bg-muted/80 active:translate-x-0.5 active:translate-y-0.5",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:translate-x-0.5 active:translate-y-0.5",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:translate-x-0.5 active:translate-y-0.5",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:translate-x-0.5 active:translate-y-0.5",
        ghost: "hover:bg-accent hover:text-accent-foreground active:translate-x-0.5 active:translate-y-0.5",
        link: "text-primary underline-offset-4 hover:underline",
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover active:translate-x-0.5 active:translate-y-0.5",
        success: "bg-success text-success-foreground hover:bg-success/90 active:translate-x-0.5 active:translate-y-0.5",
      },
      size: {
        default: "h-10 px-4 py-2 min-w-[200px]",
        sm: "h-9 rounded-md px-3 min-w-[160px]",
        lg: "h-11 rounded-md px-8 min-w-[240px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    if (variant === "link" || variant === "ghost" || size === "icon") {
      return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>{children}</Comp>;
    }
    
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
        <span className="flex items-center gap-2">
          {children}
        </span>
        <div className="absolute right-0 w-8 h-full flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-out">
          <ChevronRight className="w-4 h-4" />
        </div>
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
