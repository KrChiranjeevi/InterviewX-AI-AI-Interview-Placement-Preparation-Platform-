const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/ReportsDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add recharts import if not present
if (!content.includes('recharts')) {
    content = content.replace(
        "import {", 
        "import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';\nimport {"
    );
}

// 2. Add SectionHeader component if not present
if (!content.includes('const SectionHeader')) {
    const sectionHeader = `
const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10">
        <Icon className="h-5 w-5 text-indigo-400" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <p className="text-[11px] text-zinc-500">{subtitle}</p>
      </div>
    </div>
  </div>
);
`;
    content = content.replace('const ReportsDashboard =', sectionHeader + '\nconst ReportsDashboard =');
}

// 3. Add Constants
if (!content.includes('const RADAR_DATA')) {
    const chartsData = `
const RADAR_DATA = [
  { subject: 'Communication', A: 85, fullMark: 100 },
  { subject: 'DSA',           A: 70, fullMark: 100 },
  { subject: 'System Design', A: 55, fullMark: 100 },
  { subject: 'Problem Solving', A: 75, fullMark: 100 },
  { subject: 'Confidence',    A: 90, fullMark: 100 },
];
const MONTHLY_DATA = [
  { name: 'Jan', score: 65 }, { name: 'Feb', score: 68 },
  { name: 'Mar', score: 74 }, { name: 'Apr', score: 79 },
  { name: 'May', score: 85 }, { name: 'Jun', score: 82 }
];
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const HEAT_COLORS = ['bg-white/5', 'bg-indigo-500/20', 'bg-indigo-500/40', 'bg-indigo-500/60', 'bg-indigo-500'];
const HEATMAP_DATA = [
  { label: 'Arrays',   data: [2, 4, 1, 0, 3, 4, 2] },
  { label: 'Trees',    data: [0, 1, 3, 4, 2, 0, 1] },
  { label: 'DP',       data: [1, 0, 0, 2, 4, 3, 4] },
  { label: 'Graphs',   data: [0, 0, 2, 3, 1, 4, 2] },
  { label: 'SQL',      data: [4, 3, 4, 2, 1, 0, 0] },
  { label: 'System',   data: [0, 1, 2, 4, 4, 3, 2] },
];
`;
    content = content.replace('const ReportsDashboard = () => {', 'const ReportsDashboard = () => {\n' + chartsData);
}

// 4. Add JSX for charts
if (!content.includes('PERFORMANCE ANALYTICS')) {
    const chartsJSX = `
            {/* ──────────────────────────────────────────────────────────────── */}
            {/* PERFORMANCE ANALYTICS */}
            {/* ──────────────────────────────────────────────────────────────── */}
            <motion.div variants={fadeUp} className="mb-6">
              <SectionHeader icon={Activity} title="Performance Analytics" subtitle="Deep insights into your interview performance" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Radar Chart */}
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 backdrop-blur-sm flex flex-col items-center">
                  <div className="w-full mb-2">
                    <p className="text-xs font-bold text-white uppercase tracking-widest">Skill Radar</p>
                    <p className="text-[10px] text-zinc-500">Across 6 core dimensions</p>
                  </div>
                  <div className="h-56 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RADAR_DATA}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                        <Radar name="Score" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorRadar)" fillOpacity={0.6} />
                        <defs>
                          <linearGradient id="colorRadar" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(10,10,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Area Chart */}
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 backdrop-blur-sm">
                  <div className="mb-4">
                    <p className="text-xs font-bold text-white uppercase tracking-widest">Monthly Growth</p>
                    <p className="text-[10px] text-zinc-500">Score trend over 6 months</p>
                  </div>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={MONTHLY_DATA} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} domain={[50, 100]} />
                        <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(10,10,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
                        <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Heatmap */}
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 backdrop-blur-sm">
                  <div className="mb-4">
                    <p className="text-xs font-bold text-white uppercase tracking-widest">Skill Heatmap</p>
                    <p className="text-[10px] text-zinc-500">Weekly practice intensity</p>
                  </div>
                  <div className="flex gap-2">
                    {/* Y-axis labels */}
                    <div className="flex flex-col gap-2 pt-5">
                      {HEATMAP_DATA.map((r, i) => (
                        <div key={i} className="h-5 flex items-center justify-end pr-1">
                          <span className="text-[9px] text-zinc-500">{r.label}</span>
                        </div>
                      ))}
                    </div>
                    {/* Grid */}
                    <div className="flex-1">
                      <div className="flex justify-between mb-1.5 px-1">
                        {DAYS.map(d => <span key={d} className="text-[9px] text-zinc-500 w-full text-center">{d}</span>)}
                      </div>
                      <div className="flex flex-col gap-2">
                        {HEATMAP_DATA.map((row, i) => (
                          <div key={i} className="flex justify-between gap-1.5">
                            {row.data.map((val, j) => (
                              <div key={j} className={\`h-5 flex-1 rounded-sm \${HEAT_COLORS[val]} border border-white/5 transition-all hover:scale-110 cursor-pointer\`} title={\`\${val} sessions\`} />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
`;
    // Insert just before "Filter + Search"
    content = content.replace('{/* Filter + Search */}', chartsJSX + '\n            {/* Filter + Search */}');
}

fs.writeFileSync(filePath, content);
console.log('Successfully added charts to ReportsDashboard.jsx');
