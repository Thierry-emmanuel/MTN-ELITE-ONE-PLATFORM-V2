import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import { LineChart as LineChartIcon, Radar as RadarIcon, TrendingUp } from 'lucide-react';
import type { PlayerProfile } from '@/types/playerProfile.types';
import { PercentileRadar } from '@/components/elite/stats/PercentileRadar';
import { formatFcfa } from '@/data/playerProfile.mock';
import { SectionHeading } from './SectionHeading';

interface Props {
  player: PlayerProfile;
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[hsl(168,45%,9%)] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="font-bold text-foreground mb-1">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-1.5 text-muted-foreground">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="font-semibold text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export function TrendsSection({ player }: Props) {
  const trend = player.performanceTrend;
  const radarData = player.strengths.map(s => ({ label: s.label, value: s.value }));

  return (
    <section id="tendances" className="scroll-mt-32 py-10 sm:py-12 border-b border-border/30">
      <div className="container">
        <SectionHeading icon={TrendingUp} title="Tendances & Performance" subtitle="Forme récente, profil technique et évolution de la valeur marchande" />

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Performance trend */}
          <div className="lg:col-span-2 bg-gradient-card border border-border rounded-2xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
              <LineChartIcon className="h-3.5 w-3.5" /> Forme sur les 8 derniers matchs
            </h3>
            <div className="h-[240px] -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trend} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(168 30% 25% / 0.4)" vertical={false} />
                  <XAxis dataKey="opponent" tick={{ fill: 'hsl(168 15% 65%)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" domain={[0, 3]} tick={{ fill: 'hsl(168 15% 65%)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis yAxisId="right" orientation="right" domain={[5, 10]} tick={{ fill: 'hsl(168 15% 65%)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar yAxisId="left" dataKey="goals" name="Buts" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={16} />
                  <Bar yAxisId="left" dataKey="assists" name="Passes D." fill="#22C55E" radius={[4, 4, 0, 0]} barSize={16} />
                  <Line yAxisId="right" type="monotone" dataKey="rating" name="Note" stroke="#FCD116" strokeWidth={2.5} dot={{ r: 3, fill: '#FCD116' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Strengths radar */}
          <div className="bg-gradient-card border border-border rounded-2xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
              <RadarIcon className="h-3.5 w-3.5" /> Profil technique
            </h3>
            <PercentileRadar data={radarData} />
          </div>

          {/* Market value */}
          <div className="lg:col-span-3 bg-gradient-card border border-border rounded-2xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5" /> Évolution de la valeur marchande
            </h3>
            <div className="h-[200px] -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={player.marketValueHistory} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
                  <defs>
                    <linearGradient id="mvGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FCD116" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#FCD116" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(168 30% 25% / 0.4)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: 'hsl(168 15% 65%)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fill: 'hsl(168 15% 65%)', fontSize: 10 }}
                    axisLine={false} tickLine={false}
                    tickFormatter={(v: number) => formatFcfa(v)}
                    width={70}
                  />
                  <Tooltip
                    content={({ active, payload, label }: any) =>
                      active && payload?.length ? (
                        <div className="bg-[hsl(168,45%,9%)] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
                          <div className="font-bold text-foreground mb-1">{label}</div>
                          <div className="text-[#FCD116] font-semibold">{formatFcfa(payload[0].value)}</div>
                        </div>
                      ) : null
                    }
                  />
                  <Area type="monotone" dataKey="valueFcfa" stroke="#FCD116" strokeWidth={2.5} fill="url(#mvGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
