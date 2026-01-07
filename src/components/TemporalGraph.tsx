import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity, AlertTriangle, Info } from 'lucide-react';

interface TemporalDataPoint {
  timestamp: string;
  seconds: number;
  faceConsistency: number;
  blinkIrregularity: number;
  lipSyncMismatch: number;
  pixelArtifacts: number;
  overallRisk: number;
}

interface TemporalGraphProps {
  data: TemporalDataPoint[];
  duration: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const riskLevel = data.overallRisk > 70 ? 'High' : data.overallRisk > 40 ? 'Medium' : 'Low';
    const riskColor = data.overallRisk > 70 ? 'text-danger' : data.overallRisk > 40 ? 'text-warning' : 'text-success';

    return (
      <div className="glass-elevated p-4 min-w-[220px]">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-sm text-muted-foreground">{label}</span>
          <span className={`text-sm font-semibold ${riskColor}`}>{riskLevel} Risk</span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Face Consistency</span>
            <span className="font-medium">{data.faceConsistency}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Blink Irregularity</span>
            <span className="font-medium">{data.blinkIrregularity}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Lip-Sync Mismatch</span>
            <span className="font-medium">{data.lipSyncMismatch}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pixel Artifacts</span>
            <span className="font-medium">{data.pixelArtifacts}%</span>
          </div>
          <div className="h-px bg-border my-2" />
          <div className="flex justify-between font-semibold">
            <span>Overall Risk</span>
            <span className={riskColor}>{data.overallRisk}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const TemporalGraph = ({ data, duration }: TemporalGraphProps) => {
  const [hoveredPoint, setHoveredPoint] = useState<TemporalDataPoint | null>(null);

  const maxRiskPoint = data.reduce((max, point) => 
    point.overallRisk > max.overallRisk ? point : max
  , data[0]);

  const averageRisk = Math.round(data.reduce((sum, p) => sum + p.overallRisk, 0) / data.length);

  return (
    <div className="glass-card p-6 space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Temporal Authenticity Graph</h2>
            <p className="text-sm text-muted-foreground">Frame-by-frame manipulation analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-muted-foreground">Low Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-muted-foreground">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-danger" />
            <span className="text-muted-foreground">High Risk</span>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {maxRiskPoint && maxRiskPoint.overallRisk > 60 && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-danger/10 border border-danger/30">
          <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-danger">
              Manipulation likelihood spikes at {maxRiskPoint.timestamp}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {maxRiskPoint.overallRisk}% risk detected • Primary indicator: {
                maxRiskPoint.faceConsistency > maxRiskPoint.lipSyncMismatch 
                  ? 'Face inconsistency' 
                  : 'Lip-sync mismatch'
              }
            </p>
          </div>
        </div>
      )}

      {/* Graph */}
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            onMouseMove={(e) => {
              if (e.activePayload) {
                setHoveredPoint(e.activePayload[0].payload);
              }
            }}
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--danger))" stopOpacity={0.4} />
                <stop offset="50%" stopColor="hsl(var(--warning))" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(var(--success))" />
                <stop offset="50%" stopColor="hsl(var(--warning))" />
                <stop offset="100%" stopColor="hsl(var(--danger))" />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="timestamp" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              dy={10}
            />
            <YAxis 
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              tickFormatter={(value) => `${value}%`}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine 
              y={70} 
              stroke="hsl(var(--danger))" 
              strokeDasharray="4 4" 
              strokeOpacity={0.5}
            />
            <ReferenceLine 
              y={40} 
              stroke="hsl(var(--warning))" 
              strokeDasharray="4 4" 
              strokeOpacity={0.3}
            />
            <Area
              type="monotone"
              dataKey="overallRisk"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#riskGradient)"
              dot={false}
              activeDot={{ 
                r: 6, 
                fill: 'hsl(var(--primary))',
                stroke: 'hsl(var(--background))',
                strokeWidth: 2
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Duration</p>
          <p className="text-xl font-semibold font-mono">{Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}</p>
        </div>
        <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Avg. Risk</p>
          <p className={`text-xl font-semibold font-mono ${
            averageRisk > 70 ? 'text-danger' : averageRisk > 40 ? 'text-warning' : 'text-success'
          }`}>{averageRisk}%</p>
        </div>
        <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Peak Risk</p>
          <p className="text-xl font-semibold font-mono text-danger">{maxRiskPoint?.overallRisk}%</p>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
        <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Hover over the graph to see detailed analysis for each 2-second segment. 
          Red zones indicate potential manipulation or AI generation.
        </p>
      </div>
    </div>
  );
};
