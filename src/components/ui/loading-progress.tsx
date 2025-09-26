import { useState, useEffect } from 'react';
import { Progress } from './progress';
import { cn } from '@/lib/utils';

interface LoadingProgressProps {
  steps?: string[];
  duration?: number;
  className?: string;
}

export const LoadingProgress = ({ 
  steps = [
    'Initializing...',
    'Loading user data...',
    'Fetching profile...',
    'Setting up dashboard...',
    'Almost ready...'
  ],
  duration = 3000,
  className 
}: LoadingProgressProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const stepDuration = duration / steps.length;
    const progressIncrement = 100 / steps.length;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (progressIncrement / (stepDuration / 50));
        
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        
        const newStepIndex = Math.floor((newProgress / 100) * steps.length);
        if (newStepIndex !== currentStep && newStepIndex < steps.length) {
          setCurrentStep(newStepIndex);
        }
        
        return newProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [duration, steps.length, currentStep]);

  return (
    <div className={cn("w-full max-w-md space-y-4", className)}>
      <div className="text-center">
        <div className="text-sm font-medium text-foreground mb-2">
          {steps[currentStep]}
        </div>
        <div className="text-xs text-muted-foreground">
          {Math.round(progress)}% complete
        </div>
      </div>
      <Progress 
        value={progress} 
        className="h-2 bg-secondary"
      />
    </div>
  );
};

interface QuickLoadingProps {
  message?: string;
  className?: string;
}

export const QuickLoading = ({ 
  message = "Loading...",
  className 
}: QuickLoadingProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 30;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn("flex flex-col items-center space-y-3", className)}>
      <div className="text-sm font-medium text-foreground">
        {message}
      </div>
      <div className="w-32">
        <Progress value={progress} className="h-1" />
      </div>
    </div>
  );
};