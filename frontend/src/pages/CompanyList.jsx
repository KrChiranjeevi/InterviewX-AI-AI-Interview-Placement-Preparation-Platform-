import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/layout/Sidebar';
import { motion } from 'framer-motion';
import { FaBuilding, FaLayerGroup, FaArrowRight } from 'react-icons/fa';

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get('/company/all');
        setCompanies(res.data);
      } catch (err) {
        console.error('Failed to fetch companies', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  return (
    <div className="flex bg-slate-950 text-slate-200 min-h-screen font-sans">
      <Sidebar />
      
      <div className="flex-1 ml-64 p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <header className="mb-10">
            <h1 className="text-4xl font-bold text-white mb-2">Company Prep Mode</h1>
            <p className="text-slate-400">Target your dream company by practicing their exact interview patterns.</p>
          </header>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company, index) => {
                // Get progress tracker
                const lastRole = localStorage.getItem(`last_role_${company.name}`) || '';
                const savedSim = lastRole ? localStorage.getItem(`recruitment_sim_${company.name}_${lastRole}`) : null;
                const simData = savedSim ? JSON.parse(savedSim) : null;
                
                let progressText = 'Not Started';
                let progressPct = 0;
                if (simData) {
                  const total = company.rounds.length;
                  const current = simData.currentRoundIndex;
                  progressPct = Math.round((current / total) * 100);
                  progressText = current >= total ? 'Completed 🎉' : `${current}/${total} Completed`;
                }

                return (
                  <motion.div 
                    key={company._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 hover:shadow-[0_0_25px_rgba(79,70,229,0.12)] transition-all cursor-pointer flex flex-col relative"
                    onClick={() => navigate(`/companies/${company.name}`)}
                  >
                    {/* Background visual glow */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/3 blur-2xl rounded-full"></div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div className="h-14 w-14 bg-white rounded-xl p-2 flex items-center justify-center shadow-md">
                          <img src={company.logo} alt={company.name} className="max-h-full max-w-full object-contain" />
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          company.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          company.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                          'bg-green-500/10 text-green-400 border-green-500/20'
                        }`}>
                          {company.difficulty}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-1.5 flex items-center justify-between">
                        {company.name}
                        {simData && (
                          <span className="text-[10px] text-indigo-400 font-medium font-sans">
                            {lastRole}
                          </span>
                        )}
                      </h3>

                      {/* Recruitment Timeline progress */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Recruitment Simulation</span>
                          <span className={simData ? 'text-indigo-400 font-semibold' : 'text-slate-500'}>{progressText}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300" style={{ width: `${progressPct}%` }}></div>
                        </div>
                      </div>

                      {/* Core placement statistics */}
                      <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-800/80 pt-3.5 mb-4 mt-auto">
                        <div>
                          <span className="text-slate-500 block">CTC Package</span>
                          <span className="text-slate-200 font-semibold font-mono">{company.package || '6 - 12 LPA'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Selection Rate</span>
                          <span className="text-slate-200 font-semibold font-mono">{company.selectionRate || '5.0%'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Eligibility</span>
                          <span className="text-slate-200 font-semibold truncate block" title={company.eligibility || 'Graduates'}>
                            {company.eligibility || 'Graduates'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Est. Time</span>
                          <span className="text-slate-200 font-semibold font-mono">{company.estimatedTime || '1 Week'}</span>
                        </div>
                      </div>
                      
                      {/* Skills tags */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {company.skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="bg-slate-950 text-slate-400 text-[10px] px-2 py-0.5 rounded border border-slate-800/60 font-medium">
                            {skill}
                          </span>
                        ))}
                        {company.skills.length > 3 && (
                          <span className="bg-slate-950 text-slate-500 text-[10px] px-2 py-0.5 rounded border border-slate-800/60">
                            +{company.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-slate-800/20 p-4 border-t border-slate-800/80 flex justify-between items-center group">
                      <span className="text-indigo-400 font-semibold text-xs group-hover:text-indigo-300 transition-colors">
                        {simData ? 'Continue Simulation →' : 'Enter Simulation Pipeline →'}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CompanyList;
