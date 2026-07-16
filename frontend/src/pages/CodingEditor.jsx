import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { 
  FiPlay, FiCheck, FiChevronLeft, FiSettings, FiMenu, FiMinimize2, FiMaximize2, 
  FiClock, FiAlertCircle, FiTerminal, FiList, FiStar, FiFileText, FiRefreshCw, 
  FiSliders, FiMessageSquare, FiBookOpen, FiHelpCircle, FiCode, FiMaximize, FiMinimize,
  FiBook
} from 'react-icons/fi';
import api from '../services/api';

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python 3' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
  { id: 'c', label: 'C' },
  { id: 'csharp', label: 'C#' },
  { id: 'sql', label: 'SQL' },
];

const CodingEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [theme, setTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // UI Panels & Console States
  const [activeTab, setActiveTab] = useState('description'); // description | hints | editorial | discussion
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [consoleTab, setConsoleTab] = useState('testcase'); // testcase | result
  
  // Execution States
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [executionMode, setExecutionMode] = useState(''); // 'run' or 'submit'
  
  // Custom Test Case Inputs
  const [customInput, setCustomInput] = useState('');
  const [activeHintIndex, setActiveHintIndex] = useState(-1);

  // Recruitment Sim Params
  const params = new URLSearchParams(window.location.search);
  const isSim = params.get('sim') === 'true';
  const companyName = params.get('company') || '';
  const role = params.get('role') || '';
  const roundIndex = parseInt(params.get('roundIndex') || '0', 10);

  useEffect(() => {
    fetchProblem();
  }, [id]);

  const fetchProblem = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/coding/problems/${id}`);
      setProblem(data);
      
      let defaultLang = 'javascript';
      if (data.topics && data.topics.some(t => t.toLowerCase() === 'sql')) {
        defaultLang = 'sql';
      } else if (data.topics && data.topics.some(t => t.toLowerCase() === 'python')) {
        defaultLang = 'python';
      }
      setLanguage(defaultLang);
      
      if (data.starterCode && data.starterCode[defaultLang]) {
        setCode(data.starterCode[defaultLang]);
      } else {
        setCode(`// Write your ${defaultLang} code here\n`);
      }
      
      // Auto-populate custom input from first example if available
      if (data.examples && data.examples.length > 0) {
        setCustomInput(data.examples[0].input);
      }
    } catch (error) {
      console.error('Failed to fetch problem', error);
      // Fallback fallback
      setProblem({
        _id: '1',
        title: 'Two Sum',
        difficulty: 'Easy',
        description: 'Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.',
        examples: [
          { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' }
        ],
        constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9'],
        hints: ['Try using a hash map to look up targets in O(1) time.', 'Verify boundary cases like negative numbers and empty lists.'],
        starterCode: { javascript: 'function twoSum(nums, target) {\n  // Write your code here\n}' }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    if (problem?.starterCode && problem.starterCode[lang]) {
      setCode(problem.starterCode[lang]);
    }
  };

  const handleRun = async () => {
    setRunning(true);
    setConsoleOpen(true);
    setConsoleTab('result');
    setExecutionResult(null);
    setExecutionMode('run');
    
    try {
      const { data } = await api.post('/coding/run', { 
        problemId: problem._id,
        code, 
        language, 
        customInput 
      });
      setExecutionResult(data);
    } catch (error) {
      setExecutionResult({ 
        feedback: 'Execution Failed or Server Connection Error', 
        score: 0, 
        submission: { 
          status: 'Runtime Error', 
          passedTestCases: 0, 
          totalTestCases: 2, 
          executionTime: 0, 
          memoryUsed: 0 
        } 
      });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setConsoleOpen(true);
    setConsoleTab('result');
    setExecutionResult(null);
    setExecutionMode('submit');
    
    try {
      const { data } = await api.post('/coding/submit', { 
        problemId: problem._id, 
        code, 
        language 
      });
      setExecutionResult(data);
      
      // Recruitment Simulation Logging
      if (isSim && data.score >= 60) {
        const simKey = `recruitment_sim_${companyName}_${role}`;
        let simData = JSON.parse(localStorage.getItem(simKey)) || { currentRoundIndex: 0, scores: {} };
        simData.scores[roundIndex] = data.score;
        simData.currentRoundIndex = Math.max(simData.currentRoundIndex, roundIndex + 1);
        localStorage.setItem(simKey, JSON.stringify(simData));
      }
    } catch (error) {
      setExecutionResult({ 
        feedback: 'Submission Failed or Server Connection Error', 
        score: 0, 
        submission: { 
          status: 'Compile Error', 
          passedTestCases: 0, 
          totalTestCases: 15, 
          executionTime: 0, 
          memoryUsed: 0 
        } 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatCode = () => {
    // Basic JS code formatting simulation. Real formatters require bulky deps.
    if (editorRef.current) {
      editorRef.current.trigger('anyString', 'editor.action.formatDocument');
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Hard': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Accepted') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (status === 'Wrong Answer') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    if (status === 'Time Limit Exceeded' || status === 'Memory Limit Exceeded') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  if (loading || !problem) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col bg-[#0d0d11] text-slate-300 font-sans overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      
      {/* Top Professional Code-Workspace Header */}
      <div className="h-14 bg-[#141418] border-b border-white/5 flex items-center justify-between px-4 shrink-0 relative z-20">
        <div className="flex items-center space-x-4 min-w-0">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center space-x-1.5 text-xs font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/5 transition-all"
          >
            <FiChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Problem List</span>
          </button>
          
          <div className="hidden md:flex items-center space-x-2.5 min-w-0">
            <span className="font-bold text-white max-w-[200px] sm:max-w-[400px] truncate">{problem.title}</span>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-lg border font-extrabold uppercase tracking-wider ${getDifficultyColor(problem.difficulty)}`}>
              {problem.difficulty}
            </span>
          </div>
        </div>

        {/* Global IDE Action Controls */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <button 
            onClick={handleRun}
            disabled={running || submitting}
            className="flex items-center space-x-1 px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold border border-white/5 transition disabled:opacity-50 hover:scale-105 active:scale-95"
          >
            {running ? (
              <span className="animate-spin mr-1 h-3.5 w-3.5 border-2 border-indigo-500 border-t-transparent rounded-full" />
            ) : (
              <FiPlay className="w-3 h-3 text-indigo-400 fill-indigo-400/20" />
            )} 
            <span>Run</span>
          </button>
          
          <button 
            onClick={handleSubmit}
            disabled={running || submitting}
            className="flex items-center space-x-1 px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 hover:scale-105 active:scale-95 shadow-md shadow-emerald-500/10"
          >
            {submitting ? (
              <span className="animate-spin mr-1 h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <FiCheck className="w-3.5 h-3.5" />
            )} 
            <span>Submit</span>
          </button>
        </div>
      </div>

      {/* Main Split Screen Editor Framework */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        
        {/* Left Interactive Documentation Workspace Panel */}
        <div className="border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col bg-[#111115] w-full lg:w-[45%] h-[40vh] lg:h-full shrink-0">
          
          {/* Glassmorphic tab selection row */}
          <div className="flex h-11 border-b border-white/5 bg-[#141418] shrink-0 overflow-x-auto whitespace-nowrap scrollbar-none">
            <button 
              onClick={() => setActiveTab('description')}
              className={`flex items-center space-x-1.5 px-4 text-xs font-bold transition-all relative ${
                activeTab === 'description' ? 'text-indigo-400 bg-[#111115]' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <FiFileText className="w-3.5 h-3.5" />
              <span>Description</span>
              {activeTab === 'description' && (
                <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
              )}
            </button>
            
            <button 
              onClick={() => setActiveTab('hints')}
              className={`flex items-center space-x-1.5 px-4 text-xs font-bold transition-all relative ${
                activeTab === 'hints' ? 'text-indigo-400 bg-[#111115]' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <FiHelpCircle className="w-3.5 h-3.5" />
              <span>Hints</span>
              {activeTab === 'hints' && (
                <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
              )}
            </button>

            <button 
              onClick={() => setActiveTab('editorial')}
              className={`flex items-center space-x-1.5 px-4 text-xs font-bold transition-all relative ${
                activeTab === 'editorial' ? 'text-indigo-400 bg-[#111115]' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <FiBookOpen className="w-3.5 h-3.5" />
              <span>Editorial (AI)</span>
              {activeTab === 'editorial' && (
                <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
              )}
            </button>

            <button 
              onClick={() => setActiveTab('discussion')}
              className={`flex items-center space-x-1.5 px-4 text-xs font-bold transition-all relative ${
                activeTab === 'discussion' ? 'text-indigo-400 bg-[#111115]' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <FiMessageSquare className="w-3.5 h-3.5" />
              <span>Discussion</span>
              {activeTab === 'discussion' && (
                <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
              )}
            </button>
          </div>

          {/* Interactive Documentation Content Area */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#0f0f13] space-y-6">
            
            <AnimatePresence mode="wait">
              {activeTab === 'description' && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -5 }} 
                  className="space-y-6"
                >
                  {/* Rich Render Description */}
                  <div className="text-[14.5px] leading-relaxed text-slate-300 font-normal">
                    <div dangerouslySetInnerHTML={{ __html: problem.description }} />
                  </div>
                  
                  {/* Examples Cards */}
                  {problem.examples && problem.examples.map((ex, i) => (
                    <div key={i} className="space-y-2">
                      <span className="text-sm font-bold text-white">Example {i + 1}:</span>
                      <div className="bg-[#141419] border border-white/5 rounded-2xl p-4 font-mono text-xs text-indigo-300 whitespace-pre-wrap break-all leading-relaxed relative">
                        <div className="absolute top-3 right-3 text-[9px] text-slate-600 uppercase font-black tracking-widest pointer-events-none">Sample</div>
                        <span className="font-bold text-slate-500">Input: </span>{ex.input}{'\n'}
                        <span className="font-bold text-slate-500">Output: </span>{ex.output}{'\n'}
                        {ex.explanation && (
                          <><span className="font-bold text-slate-500">Explanation: </span>{ex.explanation}</>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Constraints Section */}
                  {problem.constraints && problem.constraints.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm font-bold text-white">Constraints:</span>
                      <ul className="space-y-1.5 pl-1.5 text-xs text-slate-400 font-mono">
                        {problem.constraints.map((c, i) => (
                          <li key={i} className="flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 bg-slate-600 rounded-full" />
                            <code className="bg-[#18181d] px-2 py-0.5 rounded-lg border border-white/5 text-indigo-200">{c}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Asked Companies */}
                  {problem.companies && problem.companies.length > 0 && (
                    <div className="space-y-2 pt-4 border-t border-white/5">
                      <span className="text-[11px] uppercase font-black text-slate-500 tracking-wider">Top Companies Asking This</span>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {problem.companies.map(c => (
                          <span key={c} className="text-xs bg-white/5 border border-white/5 text-slate-300 font-semibold px-2.5 py-1 rounded-xl">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'hints' && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -5 }} 
                  className="space-y-4"
                >
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center">
                    <FiHelpCircle className="mr-2 text-indigo-400" /> Need a hint?
                  </h3>
                  
                  {!problem.hints || problem.hints.length === 0 ? (
                    <p className="text-slate-500 text-sm">No hints available for this problem yet. Try finding alternative paths!</p>
                  ) : (
                    <div className="space-y-3">
                      {problem.hints.map((hint, i) => (
                        <div 
                          key={i} 
                          className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 cursor-pointer hover:bg-white/[0.04] transition-all"
                          onClick={() => setActiveHintIndex(activeHintIndex === i ? -1 : i)}
                        >
                          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400 select-none">
                            <span>Hint {i + 1}</span>
                            <span className="text-indigo-400">{activeHintIndex === i ? 'Hide' : 'Reveal'}</span>
                          </div>
                          <AnimatePresence>
                            {activeHintIndex === i && (
                              <motion.p 
                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                animate={{ height: 'auto', opacity: 1, marginTop: 8 }}
                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                className="text-sm text-slate-300 font-normal leading-relaxed border-t border-white/5 pt-2 whitespace-pre-wrap"
                              >
                                {hint}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'editorial' && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -5 }} 
                  className="space-y-4"
                >
                  <div className="bg-[#141419] border border-white/5 rounded-3xl p-6 text-center text-slate-400 flex flex-col items-center justify-center space-y-4">
                    <span className="text-4xl text-indigo-400">🤖</span>
                    <h3 className="text-white font-bold text-lg">AI Editorial Analysis</h3>
                    <p className="text-sm max-w-sm">Write and submit code to evaluate optimal approaches, runtime feedback, Big-O metrics, and automated tips.</p>
                    <button 
                      onClick={handleSubmit} 
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white rounded-xl transition"
                    >
                      Run Submission Analysis
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'discussion' && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -5 }} 
                  className="space-y-4"
                >
                  <h3 className="text-white font-bold text-base flex items-center">
                    <FiMessageSquare className="mr-2 text-indigo-400" /> Community Discussion
                  </h3>
                  
                  {/* Mock Chat boards */}
                  <div className="space-y-3">
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white">coder_42</span>
                        <span className="text-slate-500">2 hours ago</span>
                      </div>
                      <p className="text-sm text-slate-300">Using a map cuts the runtime complexity down from O(N^2) to O(N). Really helpful hint!</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white">dev_ninja</span>
                        <span className="text-slate-500">1 day ago</span>
                      </div>
                      <p className="text-sm text-slate-300">Make sure to check constraints, inputs can contain negative integers. Double check array values before indexing.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* Right Editor IDE Panel & Bottom Console */}
        <div className="flex-1 flex flex-col min-w-0 w-full relative h-[60vh] lg:h-full">
          
          {/* Customizable Monaco Editor Controls Header */}
          <div className="flex h-11 border-b border-white/5 bg-[#141418] items-center px-4 justify-between shrink-0 relative z-10">
            <div className="flex items-center space-x-3">
              {/* Custom SELECT Dropdown Container */}
              <div className="relative">
                <select 
                  value={language}
                  onChange={handleLanguageChange}
                  className="bg-white/5 border border-white/5 text-slate-200 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer appearance-none pr-8 hover:bg-white/10 transition-colors"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.id} value={lang.id} className="bg-[#141416]">{lang.label}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[10px]">▼</div>
              </div>
              
              {/* Font selector */}
              <div className="relative">
                <select 
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="bg-white/5 border border-white/5 text-slate-200 text-xs font-bold rounded-xl px-2 py-1.5 focus:outline-none cursor-pointer appearance-none pr-6 hover:bg-white/10 transition-colors"
                >
                  <option value={12} className="bg-[#141416]">12px</option>
                  <option value={14} className="bg-[#141416]">14px</option>
                  <option value={16} className="bg-[#141416]">16px</option>
                  <option value={18} className="bg-[#141416]">18px</option>
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[8px]">▼</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={formatCode}
                title="Format Document"
                className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all"
              >
                <FiCode className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  setCode(problem.starterCode[language] || `// Write your ${language} code here\n`);
                  setExecutionResult(null);
                  setConsoleOpen(false);
                }}
                title="Reset starter template"
                className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all"
              >
                <FiRefreshCw className="w-4 h-4" />
              </button>
              <button 
                onClick={toggleFullscreen}
                title="Toggle Fullscreen"
                className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all"
              >
                {isFullscreen ? <FiMinimize className="w-4 h-4" /> : <FiMaximize className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className={`flex-1 relative ${consoleOpen ? 'h-[50%]' : 'h-full'}`}>
            <Editor
              height="100%"
              language={language === 'c++' || language === 'cpp' ? 'cpp' : language === 'c' ? 'c' : language === 'csharp' ? 'csharp' : language}
              theme={theme}
              value={code}
              onChange={(value) => setCode(value)}
              onMount={(editor) => {
                editorRef.current = editor;
              }}
              options={{
                minimap: { enabled: false },
                fontSize: fontSize,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                lineHeight: 24,
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                formatOnPaste: true,
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnEnter: "on"
              }}
            />
          </div>

          {/* Bottom Custom Redesigned Console */}
          <div className={`border-t border-white/5 bg-[#0f0f13] flex flex-col transition-all duration-300 relative z-10 ${
            consoleOpen ? 'h-[50%] min-h-[300px]' : 'h-11 overflow-hidden'
          }`}>
            
            {/* Console Header Bar */}
            <div 
              className="h-11 bg-[#141418] border-b border-white/5 flex items-center justify-between px-4 cursor-pointer select-none shrink-0"
              onClick={() => setConsoleOpen(!consoleOpen)}
            >
              <div className="flex items-center space-x-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Console</span>
                
                {consoleOpen && (
                  <div className="flex items-center space-x-1 border-l border-white/5 pl-4" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setConsoleTab('testcase')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        consoleTab === 'testcase' ? 'bg-white/5 text-white' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      Testcase Inputs
                    </button>
                    
                    {executionResult && (
                      <button
                        onClick={() => setConsoleTab('result')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                          consoleTab === 'result' ? 'bg-white/5 text-white' : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <span>Result</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          executionResult.submission?.status === 'Accepted' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`} />
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              <button className="text-slate-400 hover:text-white transition-transform">
                {consoleOpen ? '▼' : '▲'}
              </button>
            </div>
            
            {/* Console Body Content Panels */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-[#0f0f13] relative">
              
              {consoleTab === 'testcase' && (
                <div className="h-full flex flex-col space-y-4">
                   <div className="space-y-1.5">
                     <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Testcase Standard Input (stdin):</p>
                     <textarea 
                        value={customInput}
                        onChange={(e) => setConsoleOpen(true) || setCustomInput(e.target.value)}
                        className="w-full h-32 bg-[#141419] border border-white/5 rounded-2xl p-3 text-sm text-indigo-200 font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
                        placeholder="Enter parameters for custom input evaluation..."
                     />
                   </div>
                   <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Run inputs to simulate outputs. Click Submit for complete AI analysis.</p>
                </div>
              )}

              {consoleTab === 'result' && executionResult && (
                <div className="space-y-6">
                  
                  {/* Results summary header */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pb-4 border-b border-white/5">
                    <div>
                      <span className={`text-xs px-3 py-1 rounded-lg font-bold border uppercase tracking-wider ${getStatusColor(executionResult.submission?.status)}`}>
                        {executionResult.submission?.status || 'Evaluated'}
                      </span>
                      <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mt-2">{executionMode === 'run' ? 'Simulated Dry Run' : 'Final AI Grading'}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400 font-mono">
                      <div>
                        <span className="block text-slate-500 font-bold uppercase text-[9px] tracking-widest">Test cases</span>
                        <span className="text-white font-extrabold text-sm">{executionResult.submission?.passedTestCases} / {executionResult.submission?.totalTestCases}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500 font-bold uppercase text-[9px] tracking-widest">Execution Time</span>
                        <span className="text-white font-extrabold text-sm">{executionResult.submission?.executionTime} ms</span>
                      </div>
                      <div>
                        <span className="block text-slate-500 font-bold uppercase text-[9px] tracking-widest">Memory</span>
                        <span className="text-white font-extrabold text-sm">{executionResult.submission?.memoryUsed} MB</span>
                      </div>
                      {executionMode === 'submit' && (
                        <div>
                          <span className="block text-slate-500 font-bold uppercase text-[9px] tracking-widest">Score</span>
                          <span className={`font-black text-sm ${executionResult.score >= 80 ? 'text-emerald-400' : 'text-rose-400'}`}>{executionResult.score}/100</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI review feedback blocks */}
                  <div className="space-y-4">
                    
                    {/* Simulated Output (Dry Run only) */}
                    {executionResult.simulatedOutput && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Simulated Output Log:</span>
                        <div className="bg-[#141419] p-4 border border-white/5 rounded-2xl font-mono text-xs text-emerald-300 whitespace-pre-wrap break-all leading-relaxed">
                          {executionResult.simulatedOutput}
                        </div>
                      </div>
                    )}
                    
                    {/* Editorial analysis feedback text */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider flex items-center">
                        <span className="text-indigo-400 mr-1.5">🤖</span> AI Review Feedback:
                      </span>
                      <div className="prose prose-invert prose-sm max-w-none text-slate-300 text-sm whitespace-pre-wrap font-sans leading-relaxed bg-[#141419] border border-white/5 p-4 rounded-2xl">
                        {executionResult.feedback}
                      </div>
                    </div>

                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingEditor;
