import { useState, useEffect } from 'react';
import { Loader2, Brain, Eye, Zap, Shield, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalyzingStateProps {
  fileName: string;
}

const analysisSteps = [
  { icon: Eye, label: 'Extracting frames', description: 'Analyzing video segments...' },
  { icon: Brain, label: 'AI Detection', description: 'Running neural network analysis...' },
  { icon: Zap, label: 'Artifact Analysis', description: 'Detecting pixel anomalies...' },
  { icon: Shield, label: 'Context Verification', description: 'Cross-referencing metadata...' },
];

export const AnalyzingState = ({ fileName }: AnalyzingStateProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= analysisSteps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 80);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="glass-card p-8 space-y-8 animate-fade-in">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center relative">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-ping" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Analyzing Media
        </h2>
        <p className="text-sm text-muted-foreground">
          {fileName}
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-mono text-foreground">{progress}%</span>
        </div>
        <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {analysisSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isComplete = index < currentStep;

          return (
            <div
              key={index}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border transition-all duration-300",
                isActive && "bg-primary/5 border-primary/30",
                isComplete && "bg-success/5 border-success/30",
                !isActive && !isComplete && "bg-muted/20 border-border/50 opacity-50"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                isActive && "bg-primary/10",
                isComplete && "bg-success/10",
                !isActive && !isComplete && "bg-muted/30"
              )}>
                {isComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <Icon className={cn(
                    "w-5 h-5",
                    isActive ? "text-primary animate-pulse" : "text-muted-foreground"
                  )} />
                )}
              </div>
              <div className="flex-1">
                <p className={cn(
                  "font-medium",
                  isActive && "text-foreground",
                  isComplete && "text-success",
                  !isActive && !isComplete && "text-muted-foreground"
                )}>
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {step.description}
                </p>
              </div>
              {isActive && (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
