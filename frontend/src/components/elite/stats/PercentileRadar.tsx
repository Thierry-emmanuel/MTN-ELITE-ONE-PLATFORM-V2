import { memo } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
} from 'recharts';

export interface PercentilePoint {
  label: string;
  value: number;
}

interface PercentileRadarProps {
  data: PercentilePoint[];
}

export const PercentileRadar = memo(({ data }: PercentileRadarProps) => (
  <div className="h-[220px] w-full -mx-2">
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="hsl(168 30% 30% / 0.5)" />
        <PolarAngleAxis
          dataKey="label"
          tick={{ fill: 'hsl(168 15% 65%)', fontSize: 9, textTransform: 'uppercase' } as any}
        />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          dataKey="value"
          stroke="hsl(49 97% 53%)"
          fill="hsl(49 97% 53%)"
          fillOpacity={0.28}
          strokeWidth={2}
          isAnimationActive
          animationDuration={700}
        />
      </RadarChart>
    </ResponsiveContainer>
  </div>
));
PercentileRadar.displayName = 'PercentileRadar';
