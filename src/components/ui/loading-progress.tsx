import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface LoadingProgressProps {
  steps?: string[];
  duration?: number;
  className?: string;
}

export const LoadingProgress: React.FC<LoadingProgressProps> = ({ 
  steps = [
    'Initializing...',
    'Loading user data...',
    'Fetching profile...',
    'Setting up dashboard...',
    'Almost ready...'
  ],
  duration = 3000, 
  className 
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const stepDuration = duration / steps.length;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, stepDuration);

    return () => clearInterval(interval);
  }, [steps, duration]);

  return (
    <div className={cn("flex flex-col items-center space-y-6 p-6", className)}>
      {/* Square Grid Loader */}
      <div className="relative w-16 h-16">
        {[...Array(9)].map((_, index) => {
          const row = Math.floor(index / 3);
          const col = index % 3;
          return (
            <div
              key={index}
              className="absolute w-2.5 h-2.5 bg-primary rounded-sm"
              style={{
                top: '50%',
                left: '50%',
                marginTop: `${(row - 1) * 20 - 5}px`,
                marginLeft: `${(col - 1) * 20 - 5}px`,
                animation: `squareLoader 675ms ease-in-out ${index * 75}ms infinite alternate`,
              }}
            />
          );
        })}
      </div>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {steps[currentStep] || "Loading..."}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Step {currentStep + 1} of {steps.length}
        </p>
      </div>
    </div>
  );
};

interface QuickLoadingProps {
  message?: string;
  className?: string;
}

export const QuickLoading: React.FC<QuickLoadingProps> = ({ 
  message = "Loading...", 
  className 
}) => {
  return (
    <div className={cn("flex flex-col items-center space-y-6 p-6", className)}>
      {/* Square Grid Loader */}
      <div className="relative w-16 h-16">
        {[...Array(9)].map((_, index) => {
          const row = Math.floor(index / 3);
          const col = index % 3;
          return (
            <div
              key={index}
              className="absolute w-2.5 h-2.5 bg-primary rounded-sm"
              style={{
                top: '50%',
                left: '50%',
                marginTop: `${(row - 1) * 20 - 5}px`,
                marginLeft: `${(col - 1) * 20 - 5}px`,
                animation: `squareLoader 675ms ease-in-out ${index * 75}ms infinite alternate`,
              }}
            />
          );
        })}
      </div>
      
      <p className="text-sm text-muted-foreground text-center">
        {message}
      </p>
    </div>
  );
};