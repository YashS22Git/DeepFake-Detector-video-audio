import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { UploadPanel } from '@/components/UploadPanel';
import { TemporalGraph } from '@/components/TemporalGraph';
import { AnalysisResult } from '@/components/AnalysisResult';
import { HistoryPanel } from '@/components/HistoryPanel';
import { EvidenceReport } from '@/components/EvidenceReport';
import { AnalyzingState } from '@/components/AnalyzingState';

// Mock data for temporal graph
const generateMockTemporalData = () => {
  const data = [];
  for (let i = 0; i < 30; i++) {
    const seconds = i * 2;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    // Create some interesting spikes
    let baseRisk = 20 + Math.random() * 15;
    if (i >= 9 && i <= 12) baseRisk = 60 + Math.random() * 30; // Spike around 18-24 seconds
    if (i >= 20 && i <= 22) baseRisk = 45 + Math.random() * 20; // Another spike
    
    data.push({
      timestamp: `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
      seconds,
      faceConsistency: Math.round(baseRisk + Math.random() * 10),
      blinkIrregularity: Math.round(baseRisk * 0.8 + Math.random() * 15),
      lipSyncMismatch: Math.round(baseRisk * 0.9 + Math.random() * 12),
      pixelArtifacts: Math.round(baseRisk * 0.7 + Math.random() * 8),
      overallRisk: Math.round(baseRisk),
    });
  }
  return data;
};

// Mock analysis result
const mockResult = {
  isAIGenerated: false,
  aiConfidence: 23,
  isEdited: true,
  editConfidence: 72,
  contextMismatch: false,
  contextDetails: undefined,
  overallRiskScore: 68,
  reasons: [
    'Double compression artifacts detected in video stream',
    'Scene splice identified at timestamp 00:14',
    'Inconsistent lighting between frames 00:18 - 00:24',
    'Missing EXIF metadata in original file',
  ],
  methodology: [
    'Neural Network Analysis',
    'Temporal Consistency Check',
    'Compression Artifact Detection',
    'Metadata Verification',
    'Face Landmark Tracking',
    'Audio-Visual Sync Analysis',
  ],
};

// Mock history data
const mockHistory = [
  {
    id: '1',
    fileName: 'interview_clip.mp4',
    fileType: 'video' as const,
    date: new Date(Date.now() - 1000 * 60 * 30),
    riskScore: 68,
  },
  {
    id: '2',
    fileName: 'press_conference.mp4',
    fileType: 'video' as const,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    riskScore: 12,
  },
  {
    id: '3',
    fileName: 'social_media_post.jpg',
    fileType: 'image' as const,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    riskScore: 89,
  },
];

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | undefined>();
  const [history, setHistory] = useState(mockHistory);
  const [currentFileName, setCurrentFileName] = useState('interview_clip.mp4');

  const handleFileSelect = useCallback((file: File) => {
    setCurrentFileName(file.name);
    setIsAnalyzing(true);
    setShowResults(false);
  }, []);

  const handleUrlSubmit = useCallback((url: string) => {
    // Extract filename from URL or use a default
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1] || 'video_from_url.mp4';
    setCurrentFileName(fileName);
    setIsAnalyzing(true);
    setShowResults(false);
  }, []);

  const handleAnalysisComplete = useCallback(() => {
    setIsAnalyzing(false);
    setShowResults(true);
    // Add to history
    const newItem = {
      id: Date.now().toString(),
      fileName: currentFileName,
      fileType: currentFileName.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' as const : 'video' as const,
      date: new Date(),
      riskScore: mockResult.overallRiskScore,
    };
    setHistory(prev => [newItem, ...prev]);
    setSelectedHistoryId(newItem.id);
  }, [currentFileName]);

  const handleHistorySelect = (id: string) => {
    setSelectedHistoryId(id);
    setShowResults(true);
    setIsAnalyzing(false);
  };

  const handleHistoryDelete = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    if (selectedHistoryId === id) {
      setSelectedHistoryId(undefined);
    }
  };

  const temporalData = generateMockTemporalData();

  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-grid-pattern bg-[size:50px_50px] opacity-30 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <Header />
      
      <main className="pt-20 pb-8 px-4 md:px-6 max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - History */}
          <aside className="lg:col-span-3 xl:col-span-2 order-3 lg:order-1">
            <div className="lg:sticky lg:top-24">
              <HistoryPanel 
                items={history}
                onSelect={handleHistorySelect}
                onDelete={handleHistoryDelete}
                selectedId={selectedHistoryId}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-9 xl:col-span-10 order-1 lg:order-2 space-y-6">
            {/* Upload Panel */}
            <UploadPanel 
              onFileSelect={handleFileSelect}
              onUrlSubmit={handleUrlSubmit}
              isAnalyzing={isAnalyzing}
            />

            {/* Analyzing State */}
            {isAnalyzing && (
              <AnalyzingState 
                fileName={currentFileName}
                onComplete={handleAnalysisComplete}
              />
            )}

            {/* Results */}
            {showResults && !isAnalyzing && (
              <>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <TemporalGraph data={temporalData} duration={60} />
                  <AnalysisResult result={mockResult} />
                </div>
                <EvidenceReport 
                  result={mockResult}
                  fileName={currentFileName}
                  analysisDate={new Date()}
                />
              </>
            )}

            {/* Empty State */}
            {!isAnalyzing && !showResults && (
              <div className="glass-card p-12 text-center animate-fade-in">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted/50 flex items-center justify-center">
                  <svg className="w-10 h-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Ready to Analyze
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Upload a video or image file, or paste a URL to begin forensic analysis. 
                  Our AI will detect manipulation, deepfakes, and contextual misinformation.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 mt-8">
        <div className="max-w-[1800px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 VerifyAI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">API Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
