import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      "relative w-full min-h-[200px] bg-gradient-to-br from-muted to-accent rounded-3xl overflow-hidden transition-all duration-1000 ease-in-out group hover:scale-110",
      "shadow-[rgba(100,100,111,0.2)_0px_7px_29px_0px]",
      className
    )} 
    {...props}
  >
    {/* Background gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-hover to-success opacity-90"></div>
    
    {/* Content */}
    <div className="relative z-20 p-6 h-full">
      {children}
    </div>
    
    {/* Animated decorative boxes */}
    <div className="absolute bottom-0 left-0 w-[70%] h-[70%] bg-white/30 backdrop-blur-sm border-t-2 border-r border-white/50 rounded-tl-[10%] rounded-tr-[13%] rounded-br-[42%] shadow-[-7px_7px_29px_rgba(100,100,111,0.364)] transition-all duration-1000 ease-in-out -bottom-[70%] -left-[70%] group-hover:bottom-0 group-hover:left-0 before:absolute before:inset-0 before:rounded-inherit before:opacity-0 before:transition-all before:duration-500 before:ease-in-out before:bg-gradient-to-br before:from-warning/50 before:to-destructive/50 hover:before:opacity-100 group-hover:delay-0"></div>
    
    <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-white/25 backdrop-blur-sm border-t-2 border-r border-white/50 rounded-tl-[10%] rounded-tr-[13%] rounded-br-[42%] transition-all duration-1000 ease-in-out -bottom-[50%] -left-[50%] group-hover:bottom-0 group-hover:left-0 before:absolute before:inset-0 before:rounded-inherit before:opacity-0 before:transition-all before:duration-500 before:ease-in-out before:bg-gradient-to-br before:from-success/50 before:to-primary/50 hover:before:opacity-100 group-hover:delay-200"></div>
    
    <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-white/20 backdrop-blur-sm border-t-2 border-r border-white/50 rounded-tl-[10%] rounded-tr-[13%] rounded-br-[42%] transition-all duration-1000 ease-in-out -bottom-[30%] -left-[30%] group-hover:bottom-0 group-hover:left-0 before:absolute before:inset-0 before:rounded-inherit before:opacity-0 before:transition-all before:duration-500 before:ease-in-out before:bg-gradient-to-br before:from-primary-hover/50 before:to-success/50 hover:before:opacity-100 group-hover:delay-400"></div>
    
    <div className="absolute bottom-0 left-0 w-[10%] h-[10%] bg-white/15 backdrop-blur-sm border-t-2 border-r border-white/50 rounded-tl-[10%] rounded-tr-[13%] rounded-br-[42%] transition-all duration-1000 ease-in-out -bottom-[10%] -left-[10%] group-hover:bottom-0 group-hover:left-0 group-hover:delay-600"></div>
  </div>
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
