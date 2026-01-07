import { Clock, FileVideo, FileImage, ChevronRight, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface HistoryItem {
  id: string;
  fileName: string;
  fileType: 'video' | 'image';
  date: Date;
  riskScore: number;
  thumbnail?: string;
}

interface HistoryPanelProps {
  items: HistoryItem[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  selectedId?: string;
}

export const HistoryPanel = ({ items, onSelect, onDelete, selectedId }: HistoryPanelProps) => {
  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-danger bg-danger/10 border-danger/30';
    if (score >= 40) return 'text-warning bg-warning/10 border-warning/30';
    return 'text-success bg-success/10 border-success/30';
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="glass-card p-4 space-y-4 h-full animate-fade-in" style={{ animationDelay: '0.3s' }}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Clock className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Analysis History</h2>
          <p className="text-xs text-muted-foreground">{items.length} reports</p>
        </div>
      </div>

      <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
        {items.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No analysis history yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Upload a file to get started
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={cn(
                "group relative p-3 rounded-lg border cursor-pointer transition-all duration-200",
                selectedId === item.id
                  ? "bg-primary/10 border-primary/30"
                  : "bg-muted/20 border-border/50 hover:bg-muted/40 hover:border-border"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                  {item.fileType === 'video' ? (
                    <FileVideo className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <FileImage className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate pr-6">
                    {item.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(item.date)}
                  </p>
                  <div className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2 border",
                    getRiskColor(item.riskScore)
                  )}>
                    Risk: {item.riskScore}%
                  </div>
                </div>
                <ChevronRight className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform absolute right-3 top-1/2 -translate-y-1/2",
                  selectedId === item.id && "text-primary"
                )} />
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="absolute top-2 right-8 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-danger/20 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5 text-danger" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
