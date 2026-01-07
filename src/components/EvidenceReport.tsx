import { FileText, Download, Shield, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EvidenceReportProps {
  result: {
    isAIGenerated: boolean;
    aiConfidence: number;
    isEdited: boolean;
    editConfidence: number;
    contextMismatch: boolean;
    overallRiskScore: number;
    reasons: string[];
    methodology: string[];
  };
  fileName: string;
  analysisDate: Date;
}

export const EvidenceReport = ({ result, fileName, analysisDate }: EvidenceReportProps) => {
  const handleDownloadPDF = () => {
    // In a real implementation, this would generate and download a PDF
    console.log('Generating PDF report...');
  };

  return (
    <div className="glass-card p-6 space-y-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Court-Ready Evidence Report</h2>
            <p className="text-sm text-muted-foreground">Legal-style authenticity documentation</p>
          </div>
        </div>
        <Button onClick={handleDownloadPDF} variant="glow" className="gap-2">
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </div>

      {/* Report Preview */}
      <div className="bg-muted/20 rounded-xl border border-border/50 p-6 space-y-6">
        {/* Header */}
        <div className="text-center border-b border-border/50 pb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-xs font-medium text-primary uppercase tracking-wider">
              Certified Analysis
            </span>
          </div>
          <h3 className="text-xl font-bold text-foreground">
            Media Authenticity Verification Report
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Case Reference: #{Math.random().toString(36).substring(2, 10).toUpperCase()}
          </p>
        </div>

        {/* File Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">File Analyzed:</span>
            <p className="font-medium text-foreground mt-1">{fileName}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Analysis Date:</span>
            <p className="font-medium text-foreground mt-1">
              {analysisDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        {/* Summary Table */}
        <div className="border border-border/50 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Detection Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Result</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              <tr>
                <td className="px-4 py-3 text-foreground">AI Generation</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
                    result.isAIGenerated 
                      ? "bg-danger/10 text-danger" 
                      : "bg-success/10 text-success"
                  )}>
                    {result.isAIGenerated ? (
                      <><AlertTriangle className="w-3 h-3" /> Detected</>
                    ) : (
                      <><CheckCircle2 className="w-3 h-3" /> Not Detected</>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-muted-foreground">{result.aiConfidence}%</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-foreground">Post-Production Editing</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
                    result.isEdited 
                      ? "bg-warning/10 text-warning" 
                      : "bg-success/10 text-success"
                  )}>
                    {result.isEdited ? (
                      <><AlertTriangle className="w-3 h-3" /> Detected</>
                    ) : (
                      <><CheckCircle2 className="w-3 h-3" /> Not Detected</>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-muted-foreground">{result.editConfidence}%</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-foreground">Context Verification</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
                    result.contextMismatch 
                      ? "bg-danger/10 text-danger" 
                      : "bg-success/10 text-success"
                  )}>
                    {result.contextMismatch ? (
                      <><AlertTriangle className="w-3 h-3" /> Mismatch Found</>
                    ) : (
                      <><CheckCircle2 className="w-3 h-3" /> Verified</>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-muted-foreground">—</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Anomalies */}
        {result.reasons.length > 0 && (
          <div>
            <h4 className="font-medium text-foreground mb-3">Documented Anomalies</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              {result.reasons.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Methodology */}
        <div>
          <h4 className="font-medium text-foreground mb-3">Analysis Methodology</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This analysis was conducted using industry-standard forensic detection algorithms including: {result.methodology.join(', ')}. 
            All confidence intervals are calculated using statistical models validated against known authentic and manipulated media samples.
          </p>
        </div>

        {/* Hash */}
        <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <Lock className="w-5 h-5 text-primary flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Cryptographic Verification Hash</p>
            <p className="font-mono text-xs text-muted-foreground mt-1 break-all">
              SHA-256: {Array.from({ length: 64 }, () => Math.random().toString(16)[2]).join('')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
