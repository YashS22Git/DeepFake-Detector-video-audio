import { CheckCircle2, XCircle, AlertTriangle, Shield, Zap, Eye, Brain, FileWarning } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalysisResultProps {
  result: {
    isAIGenerated: boolean;
    aiConfidence: number;
    isEdited: boolean;
    editConfidence: number;
    contextMismatch: boolean;
    contextDetails?: string;
    overallRiskScore: number;
    reasons: string[];
    methodology: string[];
  };
}

export const AnalysisResult = ({ result }: AnalysisResultProps) => {
  const getRiskLevel = (score: number) => {
    if (score >= 70) return { label: 'High Risk', color: 'danger', bg: 'bg-danger/10', border: 'border-danger/30' };
    if (score >= 40) return { label: 'Medium Risk', color: 'warning', bg: 'bg-warning/10', border: 'border-warning/30' };
    return { label: 'Low Risk', color: 'success', bg: 'bg-success/10', border: 'border-success/30' };
  };

  const risk = getRiskLevel(result.overallRiskScore);

  return (
    <div className="glass-card p-6 space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          risk.bg
        )}>
          <Shield className={cn("w-5 h-5", `text-${risk.color}`)} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Analysis Report</h2>
          <p className="text-sm text-muted-foreground">AI detection & authenticity verification</p>
        </div>
      </div>

      {/* Overall Risk Score */}
      <div className={cn(
        "p-6 rounded-xl border",
        risk.bg,
        risk.border
      )}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Overall Risk Score
          </span>
          <span className={cn(
            "px-3 py-1 rounded-full text-xs font-semibold",
            risk.bg,
            `text-${risk.color}`
          )}>
            {risk.label}
          </span>
        </div>
        <div className="flex items-end gap-2">
          <span className={cn("text-5xl font-bold font-mono", `text-${risk.color}`)}>
            {result.overallRiskScore}
          </span>
          <span className="text-2xl text-muted-foreground mb-1">/ 100</span>
        </div>
        <div className="mt-4 h-2 bg-muted/50 rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-1000",
              result.overallRiskScore >= 70 ? 'bg-danger' : 
              result.overallRiskScore >= 40 ? 'bg-warning' : 'bg-success'
            )}
            style={{ width: `${result.overallRiskScore}%` }}
          />
        </div>
      </div>

      {/* Detection Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* AI Generated */}
        <div className={cn(
          "p-4 rounded-xl border transition-all",
          result.isAIGenerated 
            ? "bg-danger/10 border-danger/30" 
            : "bg-success/10 border-success/30"
        )}>
          <div className="flex items-center gap-2 mb-3">
            <Brain className={cn("w-5 h-5", result.isAIGenerated ? "text-danger" : "text-success")} />
            <span className="font-medium">AI-Generated</span>
          </div>
          <div className="flex items-center gap-2">
            {result.isAIGenerated ? (
              <XCircle className="w-6 h-6 text-danger" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-success" />
            )}
            <span className={cn(
              "text-lg font-semibold",
              result.isAIGenerated ? "text-danger" : "text-success"
            )}>
              {result.isAIGenerated ? "Yes" : "No"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {result.aiConfidence}% confidence
          </p>
        </div>

        {/* Edited */}
        <div className={cn(
          "p-4 rounded-xl border transition-all",
          result.isEdited 
            ? "bg-warning/10 border-warning/30" 
            : "bg-success/10 border-success/30"
        )}>
          <div className="flex items-center gap-2 mb-3">
            <Zap className={cn("w-5 h-5", result.isEdited ? "text-warning" : "text-success")} />
            <span className="font-medium">Edited</span>
          </div>
          <div className="flex items-center gap-2">
            {result.isEdited ? (
              <AlertTriangle className="w-6 h-6 text-warning" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-success" />
            )}
            <span className={cn(
              "text-lg font-semibold",
              result.isEdited ? "text-warning" : "text-success"
            )}>
              {result.isEdited ? "Yes" : "No"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {result.editConfidence}% confidence
          </p>
        </div>

        {/* Context Mismatch */}
        <div className={cn(
          "p-4 rounded-xl border transition-all",
          result.contextMismatch 
            ? "bg-danger/10 border-danger/30" 
            : "bg-success/10 border-success/30"
        )}>
          <div className="flex items-center gap-2 mb-3">
            <Eye className={cn("w-5 h-5", result.contextMismatch ? "text-danger" : "text-success")} />
            <span className="font-medium">Context Match</span>
          </div>
          <div className="flex items-center gap-2">
            {result.contextMismatch ? (
              <XCircle className="w-6 h-6 text-danger" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-success" />
            )}
            <span className={cn(
              "text-lg font-semibold",
              result.contextMismatch ? "text-danger" : "text-success"
            )}>
              {result.contextMismatch ? "Mismatch" : "Valid"}
            </span>
          </div>
          {result.contextMismatch && result.contextDetails && (
            <p className="text-xs text-muted-foreground mt-2">
              {result.contextDetails}
            </p>
          )}
        </div>
      </div>

      {/* Detected Issues */}
      {result.reasons.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileWarning className="w-4 h-4 text-warning" />
            <h3 className="font-medium text-foreground">Detected Anomalies</h3>
          </div>
          <ul className="space-y-2">
            {result.reasons.map((reason, index) => (
              <li 
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
              >
                <span className="w-6 h-6 rounded-full bg-warning/20 text-warning text-xs font-medium flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-sm text-foreground">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Methodology */}
      <div className="space-y-3 pt-4 border-t border-border/50">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Analysis Methodology
        </h3>
        <div className="flex flex-wrap gap-2">
          {result.methodology.map((method, index) => (
            <span 
              key={index}
              className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50 text-xs text-muted-foreground"
            >
              {method}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
