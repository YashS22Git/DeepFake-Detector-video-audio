import { useState, useCallback } from 'react';
import { Upload, Link, FileVideo, FileImage, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface UploadPanelProps {
  onFileSelect: (file: File) => void;
  onUrlSubmit: (url: string) => void;
  isAnalyzing: boolean;
}

export const UploadPanel = ({ onFileSelect, onUrlSubmit, isAnalyzing }: UploadPanelProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [url, setUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('video/') || file.type.startsWith('image/'))) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleUrlSubmit = () => {
    if (url.trim()) {
      onUrlSubmit(url.trim());
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="glass-card p-6 space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Upload className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Media Input</h2>
          <p className="text-sm text-muted-foreground">Upload file or paste URL</p>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 text-center",
          isDragging 
            ? "border-primary bg-primary/5 scale-[1.02]" 
            : "border-border hover:border-primary/50 hover:bg-muted/30",
          isAnalyzing && "opacity-50 pointer-events-none"
        )}
      >
        {selectedFile ? (
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              {selectedFile.type.startsWith('video/') ? (
                <FileVideo className="w-6 h-6 text-primary" />
              ) : (
                <FileImage className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground truncate max-w-[200px]">
                {selectedFile.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            {!isAnalyzing && (
              <button
                onClick={clearFile}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
              <Upload className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-foreground font-medium mb-1">
              Drag & drop your media here
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports video (MP4, MOV, AVI) and images (JPG, PNG, WEBP)
            </p>
            <label>
              <input
                type="file"
                accept="video/*,image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isAnalyzing}
              />
              <Button variant="outline" size="sm" asChild>
                <span className="cursor-pointer">Browse Files</span>
              </Button>
            </label>
          </>
        )}

        {isAnalyzing && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm font-medium">Analyzing...</span>
            </div>
          </div>
        )}
      </div>

      {/* URL Input */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          <span>or paste video URL</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="https://youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-10 bg-muted/30 border-border focus:border-primary"
              disabled={isAnalyzing}
            />
          </div>
          <Button 
            onClick={handleUrlSubmit}
            disabled={!url.trim() || isAnalyzing}
            variant="glow"
          >
            Analyze
          </Button>
        </div>
      </div>
    </div>
  );
};
