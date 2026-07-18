import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaArrowLeft, FaPlay, FaCheckCircle, FaLock, 
  FaUndo, FaClock, FaCheck, FaAward, FaSlidersH, FaBrain,
  FaTimesCircle, FaTrophy, FaLightbulb, FaBriefcase, FaChevronDown, FaChevronUp
} from 'react-icons/fa';
import toast from 'react-hot-toast';

// Helper to generate dynamic mock details for passed/failed rounds
const generateRoundDetails = (roundName, score, passed, role) => {
  const diffs = ['Easy', 'Medium', 'Hard'];
  const difficulty = diffs[Math.floor(Math.random() * 3)];
  const timeTaken = `${Math.floor(Math.random() * (35 - 15 + 1)) + 15} Mins`;
  
  let strengths, weaknesses, feedback, weakTopics, recommendedCoding, resumeImprovements;

  if (passed) {
    strengths = [
      "Excellent understanding of algorithmic complexities.",
      "Clean implementation with modern design rules.",
      "Strong command over syntax and edge condition handling."
    ];
    weaknesses = [
      "Minor comments or documentation blocks were missing.",
      "Initial modular structure design took slightly longer."
    ];
    feedback = `Solid solution for the ${roundName} stage! You successfully met all logical checkpoints and kept your time efficiency within expectations. Keep up the high standard.`;
  } else {
    strengths = [
      "Logical outline structure was correct.",
      "Good naming of basic iterative variables."
    ];
    weaknesses = [
      "Failed boundary safety validations (null inputs, empty values).",
      "Sub-optimal nested loop designs causing time limits to exceed.",
      "Poor error safety structures on API integrations."
    ];
    feedback = `The performance in this round was sub-optimal. Review standard logic templates and ensure you check boundary parameters carefully.`;
    
    // Recommendations
    weakTopics = [
      role.includes('Frontend') ? 'DOM Events, React State Hooks, CSS Layouts' : 'Async IO, Database Indexing, SQL Joins',
      "Edge case validation, error boundary traps"
    ];
    recommendedCoding = [
      "Two Sum (Arrays)",
      "Valid Parentheses (Stacks)",
      "Reverse Linked List (Linked Lists)"
    ];
    resumeImprovements = [
      "Specify concrete performance metrics (e.g. 'reduced latency by 30%').",
      "Mention automation testing tools used (Jest, Cypress, or PyTest)."
    ];
  }

  return {
    score,
    passed,
    strengths,
    weaknesses,
    feedback,
    timeTaken,
    difficulty,
    weakTopics,
    recommendedCoding,
    resumeImprovements
  };
};

const generateFinalReport = (scores, simulationRounds) => {
  const activeRounds = simulationRounds.filter(r => r.name.toLowerCase() !== 'final result' && r.name.toLowerCase() !== 'final decision');
  const completedCount = Object.keys(scores).length;

  if (completedCount < activeRounds.length) {
    return null; // insufficient data
  }

  let codingTotal = 0, codingCount = 0;
  let techTotal = 0, techCount = 0;
  let hrTotal = 0, hrCount = 0;
  let systemDesignTotal = 0, systemDesignCount = 0;
  let generalTotal = 0, generalCount = 0;

  activeRounds.forEach((round, idx) => {
    const score = scores[idx] || 0;
    const name = round.name.toLowerCase();
    
    if (name.includes('coding') || name.includes('dsa') || name.includes('algorithm') || name.includes('sql') || name.includes('programming') || name.includes('aptitude') || name.includes('logical') || name.includes('quantitative') || name.includes('reasoning')) {
      codingTotal += score;
      codingCount++;
    } else if (name.includes('system design') || name.includes('architecture')) {
      systemDesignTotal += score;
      systemDesignCount++;
    } else if (name.includes('hr') || name.includes('behavioral') || name.includes('googliness') || name.includes('principles') || name.includes('bar raiser') || name.includes('managerial')) {
      hrTotal += score;
      hrCount++;
    } else if (name.includes('technical') || name.includes('dbms') || name.includes('os') || name.includes('network') || name.includes('oop')) {
      techTotal += score;
      techCount++;
    } else {
      generalTotal += score;
      generalCount++;
    }
  });

  const codingScore = codingCount > 0 ? Math.round(codingTotal / codingCount) : 70;
  const technicalScore = techCount > 0 ? Math.round(techTotal / techCount) : codingScore;
  const systemDesignScore = systemDesignCount > 0 ? Math.round(systemDesignTotal / systemDesignCount) : technicalScore;
  const hrScore = hrCount > 0 ? Math.round(hrTotal / hrCount) : 75;
  
  const totalSum = Object.values(scores).reduce((a, b) => a + b, 0);
  const overallScore = Math.round(totalSum / completedCount);

  // Dynamic Metrics derived directly from the above components
  const problemSolvingScore = Math.round((codingScore + systemDesignScore) / 2);
  const communicationScore = Math.round((hrScore + technicalScore) / 2);
  const confidenceScore = Math.round((hrScore + problemSolvingScore) / 2);

  const roleReadiness = overallScore >= 85 ? 'Highly Ready' : overallScore >= 70 ? 'Ready' : 'Needs Practice';

  let hiringDecision = 'Not Selected';
  if (overallScore >= 85) hiringDecision = 'Strong Hire';
  else if (overallScore >= 70) hiringDecision = 'Hire';
  else if (overallScore >= 60) hiringDecision = 'Borderline';
  else if (overallScore >= 50) hiringDecision = 'Needs Improvement';

  return {
    overallScore,
    codingScore,
    technicalScore,
    hrScore,
    systemDesignScore,
    communicationScore,
    confidenceScore,
    problemSolvingScore,
    roleReadiness,
    hiringDecision
  };
};

const CompanyDetail = () => {
  const { companyName } = useParams();
  const [company, setCompany] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRounds, setExpandedRounds] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedRole, setSelectedRole] = useState('');
  const [selectedRoleData, setSelectedRoleData] = useState(null);
  const [simulationRounds, setSimulationRounds] = useState([]);
  
  const [simState, setSimState] = useState({
    attemptId: null,
    currentRoundIndex: 0,
    scores: {},
    roundDetails: {},
    finalReport: null
  });

  // Load company details and roles
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await api.get(`/prep/companies/${companyName}`);
        setCompany(res.data.company);
        setRoles(res.data.roles || []);
      } catch (err) {
        console.error('Failed to fetch company details', err);
        toast.error('Failed to load company details.');
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [companyName]);

  const loadRolePipeline = async (roleObj) => {
    try {
      const resRounds = await api.get(`/prep/roles/${roleObj._id}/pipeline`);
      setSimulationRounds(resRounds.data);

      const resAttempt = await api.post('/prep/attempt', { companyId: company._id, roleId: roleObj._id });
      setSimState({
        attemptId: resAttempt.data._id,
        currentRoundIndex: resAttempt.data.currentRoundIndex || 0,
        scores: resAttempt.data.scores || {},
        roundDetails: resAttempt.data.roundDetails || {},
        finalReport: resAttempt.data.finalReport || null
      });
    } catch(err) {
      console.error(err);
      toast.error('Failed to load pipeline.');
    }
  };

  // Restore role from query param or localStorage
  useEffect(() => {
    if (company && roles.length > 0 && !selectedRole) {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get('role');
      const savedRoleId = localStorage.getItem(`last_role_id_${companyName}`);
      
      let targetRole = null;
      if (roleParam) {
        targetRole = roles.find(r => r.roleName === decodeURIComponent(roleParam));
      } else if (savedRoleId) {
        targetRole = roles.find(r => r._id === savedRoleId);
      }

      if (targetRole) {
        setSelectedRole(targetRole.roleName);
        setSelectedRoleData(targetRole);
        loadRolePipeline(targetRole);
      }
    }
  }, [company, roles]);

  // Handle simulation query results (after returning from LiveInterview or CodingEditor)
  useEffect(() => {
    if (!company || !selectedRoleData || simulationRounds.length === 0 || !simState.attemptId) return;

    const params = new URLSearchParams(window.location.search);
    const simComplete = params.get('simComplete');
    if (simComplete === 'true') {
      const processScore = async () => {
        const score = parseInt(params.get('score') || '0', 10);
        const roundIdx = parseInt(params.get('round') || '0', 10);
        const passed = score >= 60; // Assuming 60% passing for now, can be extracted from roundData
        
        const roundData = simulationRounds[roundIdx];
        const roundName = roundData?.name || `Round ${roundIdx + 1}`;
        const details = generateRoundDetails(roundName, score, passed, selectedRole);

        let newScores = { ...simState.scores, [roundIdx]: score };
        let newCurrentIdx = passed ? Math.max(simState.currentRoundIndex, roundIdx + 1) : simState.currentRoundIndex;
        let isFinal = newCurrentIdx >= simulationRounds.length - (simulationRounds[simulationRounds.length-1].name.includes('Final') ? 1 : 0);
        let finalReport = null;

        if (isFinal || newCurrentIdx === simulationRounds.length) {
           finalReport = generateFinalReport(newScores, simulationRounds);
        }

        try {
          await api.post(`/prep/attempt/${simState.attemptId}/submit`, {
            roundIndex: roundIdx,
            score,
            passed,
            details,
            isFinal,
            finalReport
          });
          
          setSimState(prev => ({
            ...prev,
            scores: newScores,
            roundDetails: { ...prev.roundDetails, [roundIdx]: details },
            currentRoundIndex: newCurrentIdx,
            finalReport
          }));

          if (passed) {
            toast.success(`Passed Round ${roundIdx + 1} with ${score}%!`, { duration: 5000 });
          } else {
            toast.error(`Round ${roundIdx + 1} failed with ${score}%. Try again.`, { duration: 5000 });
          }
        } catch (err) {
          toast.error('Failed to submit score.');
        }

        navigate(`/companies/${companyName}?role=${encodeURIComponent(selectedRole)}`, { replace: true });
      };
      
      processScore();
    }
  }, [location.search, company, selectedRoleData, simulationRounds, simState.attemptId]);

  const handleRoleSelect = (roleObj) => {
    setSelectedRole(roleObj.roleName);
    setSelectedRoleData(roleObj);
    localStorage.setItem(`last_role_${companyName}`, roleObj.roleName);
    localStorage.setItem(`last_role_id_${companyName}`, roleObj._id);
    loadRolePipeline(roleObj);
  };

  const resetSimulation = async () => {
    if (window.confirm('Are you sure you want to reset this recruitment simulation? All progress will be cleared.')) {
      try {
        await api.post(`/prep/attempt/${simState.attemptId}/reset`);
        setSimState(prev => ({
          ...prev,
          currentRoundIndex: 0,
          scores: {},
          roundDetails: {},
          finalReport: null
        }));
        toast.success('Simulation reset successfully!');
      } catch (err) {
        toast.error('Failed to reset simulation');
      }
    }
  };

  const changeRole = () => {
    setSelectedRole('');
    setSelectedRoleData(null);
  };

  const toggleRoundExpand = (idx) => {
    setExpandedRounds(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const startRoundSimulation = async (roundName, roundIndex, roundConfig) => {
    try {
      const category = roundConfig.assessmentType;
      
      if (['aptitude', 'quant', 'reasoning', 'verbal'].includes(category)) {
        toast.success(`Redirecting to ${roundName} practice...`);
        navigate(
          `/assessment/${category}?sim=true&company=${encodeURIComponent(company.name)}&role=${encodeURIComponent(selectedRole)}&roundIndex=${roundIndex}&roundName=${encodeURIComponent(roundName)}&difficulty=${company.difficulty}&duration=${encodeURIComponent(roundConfig.duration || '30 Mins')}`
        );
        return;
      }

      if (category === 'coding') {
        toast.success(`Redirecting to ${roundName} practice...`);
        navigate(
          `/coding/dsa?sim=true&company=${encodeURIComponent(company.name)}&role=${encodeURIComponent(selectedRole)}&roundIndex=${roundIndex}&roundName=${encodeURIComponent(roundName)}&difficulty=${company.difficulty}&duration=${encodeURIComponent(roundConfig.duration || '30 Mins')}`
        );
        return;
      }

      toast.loading('Initializing simulation environment...');
      
      let finalType = 'Technical Interview';
      if (category === 'hr') {
        finalType = 'HR Interview';
      }

      let rawDiff = roundConfig.difficulty || company.difficulty || 'Medium';
      let finalDiff = 'Intermediate';
      if (rawDiff === 'Hard') finalDiff = 'Advanced';
      else if (rawDiff === 'Easy') finalDiff = 'Beginner';

      let rawDuration = roundConfig.duration || '30 Mins';
      let finalDuration = '30 min';
      if (rawDuration.toLowerCase().includes('45')) finalDuration = '45 min';
      else if (rawDuration.toLowerCase().includes('15')) finalDuration = '15 min';

      const res = await api.post('/interviews/create', {
        role: `${selectedRole} - ${roundName}`,
        interviewType: finalType,
        difficulty: finalDiff,
        duration: finalDuration,
        resumeSkills: [],
        resumeText: ''
      });
      
      toast.dismiss();
      navigate(`/interview/live/${res.data._id}?sim=true&company=${company.name}&role=${encodeURIComponent(selectedRole)}&roundIndex=${roundIndex}`);
    } catch (err) {
      console.error('Failed to create simulation round', err);
      toast.dismiss();
      toast.error('Failed to start round. Check connection.');
    }
  };

  if (loading) return (
    <div className="flex bg-slate-950 min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
  );

  if (!company) return (
    <div className="flex bg-slate-950 min-h-screen items-center justify-center text-white">
      <h2>Company not found.</h2>
    </div>
  );

  return (
    <div className="flex bg-slate-950 text-slate-200 min-h-screen font-sans overflow-hidden">
      <Sidebar />
      <div className="relative z-10 flex-1 pl-0 md:pl-[72px] flex flex-col h-screen overflow-hidden">
        <Navbar subtitle={`${company.name} Interview Preparation`} />
        <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto pb-16"
          >
          <button 
            onClick={() => navigate('/companies')}
            className="flex items-center text-slate-400 hover:text-white mb-8 transition-colors text-sm font-medium"
          >
            <FaArrowLeft className="mr-2 text-xs" /> Back to Companies
          </button>

          {/* Premium Header */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"></div>

            <div className="h-28 w-28 bg-white rounded-2xl p-4 flex items-center justify-center shadow-2xl shrink-0 z-10">
              <img src={company.logo} alt={company.name} className="max-h-full max-w-full object-contain" />
            </div>

            <div className="flex-1 text-center md:text-left z-10">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-4xl font-extrabold text-white tracking-tight">{company.name}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  company.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                  company.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {company.difficulty} Match
                </span>
                {selectedRole && (
                  <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs px-3 py-1 rounded-full font-semibold">
                    Target: {selectedRole}
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-base max-w-2xl mb-4">
                {company.about || `Real-world simulation of ${company.name}'s multi-stage recruitment pipeline. Select your target role to begin the simulation.`}
              </p>
              
              {selectedRole && (
                <div className="flex justify-center md:justify-start gap-3">
                  <button 
                    onClick={changeRole}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <FaSlidersH /> Change Role
                  </button>
                  <button 
                    onClick={resetSimulation}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <FaUndo /> Reset Simulation
                  </button>
                </div>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!selectedRole ? (
              // Step 1: Target Role Selection
              <motion.div
                key="role-selection"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-slate-900 border border-slate-800/80 rounded-3xl p-8"
              >
                <div className="text-center mb-8">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full mb-3 inline-block">Step 1</span>
                  <h2 className="text-2xl font-bold text-white mb-2">Choose Your Target Job Role</h2>
                  <p className="text-slate-400 text-sm">We will tailor the recruitment rounds, questions, and difficulty specific to this role.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {roles.map((role) => (
                    <motion.button
                      key={role._id}
                      whileHover={{ y: -3, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRoleSelect(role)}
                      className="bg-slate-950 hover:bg-indigo-600/10 border border-slate-800 hover:border-indigo-500/60 p-5 rounded-2xl text-left transition-all hover:shadow-[0_0_15px_rgba(99,102,241,0.1)] flex flex-col justify-between h-36 relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full group-hover:bg-indigo-500/10 transition-colors pointer-events-none"></div>
                      <div>
                        <span className="text-white font-bold text-base line-clamp-2 z-10 mb-1">{role.roleName}</span>
                        <span className="text-slate-400 text-xs line-clamp-2 z-10">{role.description}</span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        {role.tags?.slice(0,2).map(tag => (
                          <span key={tag} className="text-[9px] bg-slate-800 text-slate-300 px-2 py-1 rounded-md">{tag}</span>
                        ))}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              // Step 2: Recruitment Timeline Simulation
              <motion.div
                key="recruitment-simulation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Timeline Stepper (Left 2 columns) */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Final report if available */}
                  {simState.finalReport ? (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border border-indigo-500/30 rounded-3xl p-6 md:p-8 shadow-[0_0_35px_rgba(99,102,241,0.15)] relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-56 h-56 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"></div>
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-6 mb-6">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/15 border border-indigo-500/20 px-2.5 py-1 rounded-md mb-2 inline-block">Placement Decision</span>
                          <h2 className="text-3xl font-extrabold text-white">Final Hiring Decision</h2>
                          <p className="text-xs text-slate-400 mt-1">Based on evaluations from all placement stages for <strong className="text-slate-300">{selectedRole}</strong>.</p>
                        </div>
                        <div className="text-center md:text-right shrink-0">
                          <span className={`text-xl md:text-2xl font-black uppercase tracking-wider px-6 py-2.5 rounded-2xl border flex items-center gap-2 shadow-lg ${
                            simState.finalReport.hiringDecision.includes('Hire')
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}>
                            <FaTrophy /> {simState.finalReport.hiringDecision}
                          </span>
                        </div>
                      </div>

                      {/* Score Rings Matrix */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        {[
                          { label: 'Overall Average', value: `${simState.finalReport.overallScore}%`, color: 'text-indigo-400' },
                          { label: 'Coding & Logic', value: `${simState.finalReport.codingScore}%`, color: 'text-emerald-400' },
                          { label: 'System Architecture', value: `${simState.finalReport.technicalScore}%`, color: 'text-amber-400' },
                          { label: 'Communication/HR', value: `${simState.finalReport.communicationScore}%`, color: 'text-purple-400' }
                        ].map((stat, i) => (
                          <div key={i} className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 text-center">
                            <span className="text-[10px] text-slate-500 block mb-1 uppercase tracking-wider font-semibold">{stat.label}</span>
                            <span className={`text-xl font-bold ${stat.color} font-mono`}>{stat.value}</span>
                          </div>
                        ))}
                      </div>

                      {/* Extended Scores Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-6 text-sm">
                        <div className="space-y-3">
                          <h4 className="font-bold text-slate-300">Technical Readiness Metrics</h4>
                          <div className="space-y-2 font-mono">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500">Problem Solving Score</span>
                              <span className="text-slate-300">{simState.finalReport.problemSolvingScore}%</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500">System Design (OOPs)</span>
                              <span className="text-slate-300">{simState.finalReport.technicalScore}%</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500">Role Specific Knowledge</span>
                              <span className="text-slate-300">{simState.finalReport.codingScore}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-bold text-slate-300">Behavioral Performance</h4>
                          <div className="space-y-2 font-mono">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500">Communication skills</span>
                              <span className="text-slate-300">{simState.finalReport.communicationScore}%</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500">Confidence and presence</span>
                              <span className="text-slate-300">{simState.finalReport.confidenceScore}%</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500">Role Readiness Standard</span>
                              <span className="text-slate-300 font-bold text-indigo-400">{simState.finalReport.roleReadiness}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 text-center text-slate-500 mb-6">
                      <FaTrophy className="mx-auto text-3xl text-slate-600 mb-3" />
                      <h3 className="text-white font-bold mb-1">Insufficient data to generate a hiring decision.</h3>
                      <p className="text-xs">You must complete all active assessment rounds of this simulation to receive a hiring decision and a comprehensive performance summary.</p>
                    </div>
                  )}

                  <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                      <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl text-lg"><FaBrain /></span>
                      Recruitment Simulation Timeline
                    </h2>

                    <div className="relative pl-8 border-l border-slate-800 space-y-8">
                      {simulationRounds.map((round, idx) => {
                        const isCompleted = idx < simState.currentRoundIndex;
                        const isActive = idx === simState.currentRoundIndex;
                        const isLocked = idx > simState.currentRoundIndex;
                        const isFinal = idx === simulationRounds.length - 1;
                        const roundScore = simState.scores[idx];
                        const details = simState.roundDetails[idx];
                        const isExpanded = expandedRounds[idx];

                        return (
                          <div key={idx} className="relative">
                            {/* Stepper Circle */}
                            <div className={`absolute -left-[45px] top-1.5 w-8 h-8 rounded-full border flex items-center justify-center font-bold text-sm transition-all z-10 ${
                              isCompleted 
                                ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                                : isActive 
                                  ? details && !details.passed
                                    ? 'bg-red-500 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                                    : 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] animate-pulse' 
                                  : 'bg-slate-900 border-slate-800 text-slate-500'
                            }`}>
                              {isCompleted ? <FaCheck className="text-xs" /> : isLocked ? <FaLock className="text-xs" /> : idx + 1}
                            </div>

                            {/* Round Card */}
                            <motion.div 
                              className={`border rounded-2xl p-5 md:p-6 transition-all ${
                                isActive 
                                  ? details && !details.passed
                                    ? 'bg-red-950/10 border-red-500/30 shadow-[0_0_25px_rgba(239,68,68,0.05)]'
                                    : 'bg-indigo-950/20 border-indigo-500/40 shadow-[0_0_25px_rgba(99,102,241,0.08)]' 
                                  : isCompleted 
                                    ? 'bg-slate-900/40 border-slate-800/60 opacity-85 hover:opacity-100' 
                                    : 'bg-slate-950/20 border-slate-900 opacity-50'
                              }`}
                            >
                              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                                <div>
                                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                    isCompleted 
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                      : isActive 
                                        ? details && !details.passed
                                          ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse'
                                          : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30' 
                                        : 'bg-slate-800 text-slate-500'
                                  }`}>
                                    {isCompleted ? 'Completed' : isActive ? (details && !details.passed ? 'Failed' : 'Active Round') : 'Locked'}
                                  </span>
                                  <h3 className="text-lg font-bold text-white mt-1.5">{round.name}</h3>
                                </div>

                                {isCompleted && roundScore !== undefined && (
                                  <button 
                                    onClick={() => toggleRoundExpand(idx)}
                                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-xl border border-slate-700 font-medium transition-colors"
                                  >
                                    <FaAward className="text-indigo-400" /> Score: {roundScore}%
                                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                  </button>
                                )}
                              </div>

                              {/* Locked Round display */}
                              {isLocked && (
                                <p className="text-slate-500 text-xs md:text-sm">Complete previous stage elements to unlock this process round.</p>
                              )}

                              {/* Active Round or Expanded Completed details */}
                              {!isLocked && (
                                <>
                                  <p className="text-slate-400 text-xs md:text-sm leading-relaxed mb-4">{round.instructions}</p>
                                  
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/50 rounded-xl p-3 border border-slate-800/40 text-xs mb-4">
                                    <div>
                                      <span className="text-slate-500 block mb-0.5">Duration</span>
                                      <span className="text-slate-300 font-medium font-mono flex items-center gap-1"><FaClock className="text-[10px]" /> {round.duration}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 block mb-0.5">Passing Score</span>
                                      <span className="text-slate-300 font-medium font-mono">{round.passingScore}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 block mb-0.5">Difficulty</span>
                                      <span className="text-slate-300 font-medium">{round.difficulty}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 block mb-0.5">Focus Areas</span>
                                      <span className="text-slate-300 font-medium truncate block" title={round.skillsRequired?.join(', ')}>
                                        {round.skillsRequired?.join(', ')}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Active but Failed details */}
                                  {isActive && details && !details.passed && (
                                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5 mb-4 text-xs space-y-4">
                                      <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                                        <FaTimesCircle /> Assessment Failed ({details.score}%)
                                      </div>
                                      <p className="text-slate-300 leading-relaxed">{details.feedback}</p>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-4">
                                        <div>
                                          <span className="text-slate-500 block mb-1.5 font-bold uppercase tracking-wider text-[9px]">Weak Topics</span>
                                          <div className="flex flex-wrap gap-1">
                                            {details.weakTopics?.map(t => (
                                              <span key={t} className="bg-slate-900 border border-slate-800 text-slate-300 px-2 py-1 rounded text-[10px]">{t}</span>
                                            ))}
                                          </div>
                                        </div>
                                        <div>
                                          <span className="text-slate-500 block mb-1.5 font-bold uppercase tracking-wider text-[9px]">Recommended Coding</span>
                                          <div className="space-y-1">
                                            {details.recommendedCoding?.map(c => (
                                              <button key={c} onClick={() => navigate('/coding/dsa')}
                                                className="text-indigo-400 hover:text-indigo-300 hover:underline block text-left text-[10px]">{c}</button>
                                            ))}
                                          </div>
                                        </div>
                                      </div>

                                      <button
                                        onClick={resetSimulation}
                                        className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-semibold py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
                                      >
                                        <FaUndo /> Reset Simulation To Retry
                                      </button>
                                    </div>
                                  )}

                                  {/* Active and Uncompleted round */}
                                  {isActive && !details && !isFinal && (
                                    <button
                                      onClick={() => startRoundSimulation(round.name, idx, round)}
                                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.25)] flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] text-sm"
                                    >
                                      <FaPlay className="text-xs" /> Start Round Simulation
                                    </button>
                                  )}

                                  {/* Expanded Completed Round Details */}
                                  {isCompleted && isExpanded && details && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-xs space-y-3 mt-4"
                                    >
                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-white/5 pb-3 font-mono">
                                        <div>
                                          <span className="text-slate-500 block text-[9px] uppercase font-semibold">Evaluation Status</span>
                                          <span className="text-emerald-400 font-bold">Passed ✅</span>
                                        </div>
                                        <div>
                                          <span className="text-slate-500 block text-[9px] uppercase font-semibold">Round Score</span>
                                          <span className="text-slate-200">{details.score}%</span>
                                        </div>
                                        <div>
                                          <span className="text-slate-500 block text-[9px] uppercase font-semibold">Time Taken</span>
                                          <span className="text-slate-200">{details.timeTaken}</span>
                                        </div>
                                        <div>
                                          <span className="text-slate-500 block text-[9px] uppercase font-semibold">Difficulty Rating</span>
                                          <span className="text-slate-200">{details.difficulty}</span>
                                        </div>
                                      </div>
                                      
                                      <p className="text-slate-300 italic">"{details.feedback}"</p>
                                    </motion.div>
                                  )}

                                  {isActive && isFinal && (
                                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-6 text-center">
                                      <div className="text-4xl mb-2">🎉</div>
                                      <h4 className="text-lg font-bold text-white mb-1">Recruitment Simulation Cleared!</h4>
                                      <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
                                        Congratulations! You have completed all rounds of the {company.name} simulation. View your Final Recruitment Report at the top of the timeline!
                                      </p>
                                    </div>
                                  )}
                                </>
                              )}
                            </motion.div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Requirements Sidebar (Right 1 column) */}
                <div className="space-y-6">
                  {/* Required Skills matching target role */}
                  <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 md:p-8">
                    <h3 className="text-lg font-bold text-white mb-4">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRoleData?.skillsRequired?.map((skill, idx) => (
                        <span key={idx} className="bg-slate-950 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2"></span>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tips Card */}
                  <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden">
                    <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-indigo-500/10 blur-2xl rounded-full"></div>
                    <h3 className="text-base font-bold text-white mb-2">Simulating Real Processes</h3>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      This module simulates the actual recruitment pipeline of {company.name}. 
                      The AI will assume you are applying for the role of <strong>{selectedRole}</strong>. 
                      Rounds are progressive: passing one unlocks the next. Be structural, sound confident, and make it count!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;
