import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import StatCard from '../components/dashboard/StatCard';
import api from '../services/api';
import { motion } from 'framer-motion';
import { FaBullseye, FaStar, FaFire, FaTrophy, FaArrowRight } from 'react-icons/fa';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeSims, setActiveSims] = useState([]);
  const navigate = useNavigate();

  // chartData and recentInterviews will come from stats

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await api.get('/dashboard/stats');
        setStats(statsRes.data);
        
        if (!localStorage.getItem('onboarded')) {
          setShowOnboarding(true);
        }
        
        // Parse active company simulations from localStorage
        const list = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('recruitment_sim_')) {
            const prefixLength = 'recruitment_sim_'.length;
            const remaining = key.substring(prefixLength);
            const separatorIndex = remaining.indexOf('_');
            if (separatorIndex !== -1) {
              const companyName = remaining.substring(0, separatorIndex);
              const role = remaining.substring(separatorIndex + 1);
              try {
                const simData = JSON.parse(localStorage.getItem(key));
                list.push({
                  companyName,
                  role,
                  currentRoundIndex: simData.currentRoundIndex,
                  completed: simData.finalReport ? true : false,
                  hiringDecision: simData.finalReport ? simData.finalReport.hiringDecision : null
                });
              } catch (e) {
                console.error(e);
              }
            }
          }
        }
        setActiveSims(list);
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const closeOnboarding = () => {
    localStorage.setItem('onboarded', 'true');
    setShowOnboarding(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-950 items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden relative">
        <Navbar subtitle="Ready for today's interview practice?" />
        
        {/* Onboarding Modal */}
        {showOnboarding && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                👋
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to InterviewX AI!</h2>
              <p className="text-slate-400 mb-6">
                Your journey to acing your next interview starts here. Make sure to head over to your <Link to="/profile" className="text-indigo-400 font-semibold hover:underline">Profile</Link> to set your target role and goals for personalized AI feedback.
              </p>
              <button 
                onClick={closeOnboarding}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors w-full"
              >
                Let's Get Started
              </button>
            </motion.div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-8 no-scrollbar">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-3xl p-8 mb-8 bg-gradient-to-r from-indigo-900/40 to-slate-900/40 border border-indigo-500/20 relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/10 to-transparent"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-3">Ready to crack your next interview? 🚀</h2>
                <p className="text-indigo-200 text-lg max-w-xl">
                  Practice with AI interviewer, get instant feedback, and improve your skills.
                </p>
              </div>
              <button 
                onClick={() => navigate('/interview/setup')}
                className="mt-6 md:mt-0 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] flex items-center"
              >
                Start AI Mock Interview <FaArrowRight className="ml-2" />
              </button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Interviews" value={`${stats?.totalInterviews || 0} Completed`} icon={<FaBullseye />} delay={0.1} />
            <StatCard title="Average Score" value={`${stats?.averageScore || 0}%`} icon={<FaStar />} delay={0.2} />
            <StatCard title="Confidence Level" value={`${stats?.confidenceLevel || 0}%`} icon={<FaFire />} delay={0.3} />
            <StatCard title="Current Goal" value={stats?.currentGoal || 'Not Set'} icon={<FaTrophy />} delay={0.4} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Chart Section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2 glass-card rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-6">Performance Progress</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.chartData || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(99, 102, 241, 0.5)', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* AI Recommendation */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card rounded-2xl p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">🤖</div>
              <h3 className="text-xl font-bold text-white mb-6">AI Recommendations</h3>
              
              <div className="space-y-4 relative z-10">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-red-200 font-medium">⚠️ Area of Improvement</p>
                  <p className="text-slate-300 text-sm mt-1">Your system design score needs improvement. Practice more backend architecture questions.</p>
                </div>
                
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <p className="text-green-200 font-medium">🌟 Strengths</p>
                  <p className="text-slate-300 text-sm mt-1">Excellent communication skills during HR rounds. Keep it up!</p>
                </div>
                
                <Link to="/reports" className="block text-center w-full py-3 mt-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-medium border border-slate-700">
                  View Full Analysis
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Recent Interviews Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-card rounded-2xl p-6 mb-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Recent Interviews</h3>
              <Link to="/interviews" className="text-indigo-400 hover:text-indigo-300 font-medium text-sm flex items-center">
                View All <FaArrowRight className="ml-1 text-xs" />
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-sm">
                    <th className="pb-3 font-medium px-4">Interview Name</th>
                    <th className="pb-3 font-medium px-4">Date</th>
                    <th className="pb-3 font-medium px-4">Score</th>
                    <th className="pb-3 font-medium px-4">Status</th>
                    <th className="pb-3 font-medium px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats?.recentInterviews || []).map((interview, idx) => (
                    <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-4 font-medium text-white">{interview.name}</td>
                      <td className="py-4 px-4 text-slate-400">{interview.date}</td>
                      <td className="py-4 px-4 text-white font-semibold">
                        <span className={`px-2 py-1 rounded text-xs ${interview.score >= 80 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {interview.score}%
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-slate-300 text-sm">{interview.status}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link to={`/report/${interview.id}`} className="text-indigo-400 hover:text-indigo-300 font-medium text-sm bg-indigo-500/10 px-3 py-1.5 rounded-lg transition-colors">
                          View Report
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Active Recruitment Simulations */}
          {activeSims.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="glass-card rounded-2xl p-6 mb-8 border border-indigo-500/10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Active Recruitment Simulations</h3>
                <Link to="/companies" className="text-indigo-400 hover:text-indigo-300 font-medium text-sm flex items-center">
                  All Companies <FaArrowRight className="ml-1 text-xs" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeSims.map((sim, idx) => (
                  <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-white font-bold text-base">{sim.companyName}</span>
                        <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-medium">{sim.role}</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        {sim.completed ? (
                          <span className="text-emerald-450 font-bold flex items-center gap-1">
                            Decision: {sim.hiringDecision} 🎉
                          </span>
                        ) : (
                          <span>Round {sim.currentRoundIndex + 1} Pending</span>
                        )}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => navigate(`/companies/${sim.companyName}?role=${encodeURIComponent(sim.role)}`)}
                      className={`text-xs px-4 py-2 rounded-lg font-medium transition-all ${
                        sim.completed 
                          ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700' 
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                    >
                      {sim.completed ? 'View Report' : 'Continue'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
