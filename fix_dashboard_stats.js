const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/Dashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace circular progress (there are two places with averageScore/confidenceLevel)
content = content.replace(
    `<CircularProgress value={averageScore || 76} size={88} stroke={7} gradient={['#6366f1','#a855f7']} />
                  <div className="hidden sm:flex flex-col gap-3">
                    <CircularProgress value={confidenceLevel || 65} size={64} stroke={5} gradient={['#f59e0b','#ef4444']} />
                    <CircularProgress value={78} size={64} stroke={5} gradient={['#10b981','#06b6d4']} />
                  </div>`,
    `<CircularProgress value={stats?.averageScore || 0} size={88} stroke={7} gradient={['#6366f1','#a855f7']} label="Avg Score" />
                  <div className="hidden sm:flex flex-col gap-3">
                    <CircularProgress value={stats?.confidenceLevel || 0} size={64} stroke={5} gradient={['#f59e0b','#ef4444']} label="Confidence" />
                  </div>`
);

// 2. Replace bottom bar
content = content.replace(
    `<span className="flex items-center gap-1.5"><Flame className="h-3.5 w-3.5 text-orange-400" /> <b className="text-white">14-day</b> streak</span>
                <span className="flex items-center gap-1.5"><Trophy className="h-3.5 w-3.5 text-yellow-400" /> <b className="text-white">Level {stats?.level||12}</b> · {(stats?.xp||1200)%500}/500 XP</span>
                <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-purple-400" /> Daily challenge: <b className="text-white ml-1">+150 XP</b></span>
                <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-emerald-400" /> <b className="text-white">Top 8%</b> of candidates</span>`,
    `<span className="flex items-center gap-1.5"><Flame className="h-3.5 w-3.5 text-orange-400" /> <b className="text-white">{stats?.streakCount || 0}-day</b> streak</span>
                <span className="flex items-center gap-1.5"><Trophy className="h-3.5 w-3.5 text-yellow-400" /> <b className="text-white">Level {stats?.level||1}</b> · {(stats?.xp||0)%500}/500 XP</span>`
);

// 3. Replace grid
const oldGrid = `                {[
                  { label: 'Interview Score',   val: averageScore||76, suffix:'%',   gradient:['#6366f1','#8b5cf6'], icon: Star,         sub: '+5% this week' },
                  { label: 'AI Readiness',       val: 82,              suffix:'%',   gradient:['#a855f7','#ec4899'], icon: Brain,        sub: 'FAANG-ready' },
                  { label: 'Confidence',         val: confidenceLevel||65, suffix:'%', gradient:['#f59e0b','#ef4444'],icon: Flame,       sub: 'Improving' },
                  { label: 'Communication',      val: 88,              suffix:'%',   gradient:['#10b981','#06b6d4'], icon: MessageSquare, sub: 'Strong area' },
                  { label: 'Coding Score',       val: 74,              suffix:'%',   gradient:['#0ea5e9','#6366f1'], icon: Code2,        sub: 'Needs focus' },
                  { label: 'Problem Solving',    val: 78,              suffix:'%',   gradient:['#8b5cf6','#ec4899'], icon: Lightbulb,    sub: 'Above avg' },
                  { label: 'Total Interviews',   val: totalInterviews||12, suffix:'', gradient:['#0ea5e9','#10b981'], icon: Mic,         sub: 'Completed' },
                  { label: 'XP Earned',          val: stats?.xp||2400, suffix:' XP', gradient:['#f59e0b','#a855f7'], icon: Coins,       sub: 'Level 12' },
                  { label: 'Offer Prediction',   val: 67,              suffix:'%',   gradient:['#10b981','#0ea5e9'], icon: Target,       sub: 'Based on perf' },
                  { label: 'Hire Probability',   val: 71,              suffix:'%',   gradient:['#a855f7','#ec4899'], icon: Rocket,       sub: 'FAANG target' },
                  { label: 'Current Rank',        val: 8,              suffix:'th%', gradient:['#f59e0b','#ef4444'], icon: Trophy,       sub: 'Global rank' },
                  { label: 'Avg Response Time',  val: 42,              suffix:'s',   gradient:['#0ea5e9','#6366f1'], icon: Timer,        sub: 'Target: <60s' },
                ].map((s, i) => {`;

const newGrid = `                {[
                  { label: 'Interview Score',   val: stats?.averageScore || 0,   suffix:'%',   gradient:['#6366f1','#8b5cf6'], icon: Star,         sub: 'Overall Average' },
                  { label: 'Total Interviews',  val: stats?.totalInterviews || 0,suffix:'',    gradient:['#0ea5e9','#10b981'], icon: Mic,         sub: 'Completed' },
                  { label: 'Confidence',        val: stats?.confidenceLevel || 0,suffix:'%',   gradient:['#f59e0b','#ef4444'], icon: Flame,       sub: 'Avg Confidence' },
                  { label: 'XP Earned',         val: stats?.xp || 0,             suffix:' XP', gradient:['#f59e0b','#a855f7'], icon: Coins,       sub: \`Level \${stats?.level || 1}\` },
                  { label: 'Current Level',     val: stats?.level || 1,          suffix:'',    gradient:['#a855f7','#ec4899'], icon: Trophy,      sub: 'Keep leveling up' },
                  { label: 'Streak Count',      val: stats?.streakCount || 0,    suffix:' d',  gradient:['#10b981','#0ea5e9'], icon: Target,      sub: 'Current streak' },
                ].map((s, i) => {`;

content = content.replace(oldGrid, newGrid);

// 4. Update the navbar subtitle string
content = content.replace(
    `subtitle={\`\${fmt(time)} · \${totalInterviews} sessions completed\`}`,
    `subtitle={\`\${fmt(time)} · \${stats?.totalInterviews || 0} sessions completed\`}`
);

// 5. Add fmt if it doesn't exist
if (!content.includes('const fmt = new Intl.')) {
    content = content.replace(
        'const { user } = useContext(AuthContext);',
        `const { user } = useContext(AuthContext);\n  const fmt = new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format;`
    );
}

fs.writeFileSync(filePath, content);
console.log('Script completed');
