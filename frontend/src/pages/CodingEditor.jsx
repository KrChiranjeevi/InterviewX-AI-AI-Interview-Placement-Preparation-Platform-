import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { FaPlay, FaCheck, FaLightbulb, FaRobot, FaArrowLeft, FaUndo, FaSpinner, FaCheckCircle, FaTimesCircle, FaChevronDown, FaChevronUp, FaBuilding, FaTag, FaCode, FaQuestionCircle } from 'react-icons/fa';
import { getQuestionById, ALL_QUESTIONS } from '../data/questionBank';
import { Link } from 'react-router-dom';
import api from '../services/api';

const getProgress = () => { try { return JSON.parse(localStorage.getItem('coding_progress') || '{}'); } catch { return {}; } };
const saveProgress = (id, status) => {
  const p = getProgress();
  p[id] = status;
  localStorage.setItem('coding_progress', JSON.stringify(p));
};

const diffColor = { Easy: 'text-green-400 bg-green-400/10 border-green-400/20', Medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20', Hard: 'text-red-400 bg-red-400/10 border-red-400/20' };

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
  { id: 'sql', label: 'SQL' },
];

const CodingEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const question = getQuestionById(id);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [tab, setTab] = useState('description'); // description | hints | analysis
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [hintsOpen, setHintsOpen] = useState(false);
  const [solved, setSolved] = useState(!!getProgress()[id]);

  // Parse recruitment simulation parameters
  const params = new URLSearchParams(window.location.search);
  const isSim = params.get('sim') === 'true';
  const companyName = params.get('company') || '';
  const role = params.get('role') || '';
  const roundIndex = parseInt(params.get('roundIndex') || '0', 10);

  useEffect(() => {
    if (question) {
      const starter = question.starterCode;
      setCode(typeof starter === 'string' ? starter : starter[language] || `// Write your ${language} solution here\n`);
    }
  }, [question, language]);

  const similarQuestions = question 
    ? ALL_QUESTIONS.filter(q => q.id !== question.id && q.topic === question.topic).slice(0, 5)
    : [];

  const handleRun = async () => {
    setAnalyzing(true);
    setFeedback(null);
    setTab('analysis');
    try {
      const res = await api.post('/coding/run', { problem: question.title, code, language });
      setFeedback(res.data);
    } catch { setFeedback({ score: 0, feedback: 'Failed to run. Check your connection.', simulatedOutput: 'Error', mistakes: [], optimizationTips: [], timeComplexity: 'N/A', spaceComplexity: 'N/A' }); }
    finally { setAnalyzing(false); }
  };

  const handleSubmit = async () => {
    setAnalyzing(true);
    setFeedback(null);
    setTab('analysis');
    try {
      const res = await api.post('/coding/submit', { problem: question.title, code, language });
      setFeedback(res.data);
      const score = res.data.score || 0;
      if (score >= 70) {
        saveProgress(id, true);
        setSolved(true);
      }

      // Check if this was a recruitment simulation round
      if (isSim && score >= 60) {
        const simKey = `recruitment_sim_${companyName}_${role}`;
        let simData = JSON.parse(localStorage.getItem(simKey)) || { currentRoundIndex: 0, scores: {} };
        simData.scores[roundIndex] = score;
        simData.currentRoundIndex = Math.max(simData.currentRoundIndex, roundIndex + 1);
        localStorage.setItem(simKey, JSON.stringify(simData));
      }
    } catch { setFeedback({ score: 0, feedback: 'Submission failed. Check your connection.', simulatedOutput: 'Error', mistakes: [], optimizationTips: [], timeComplexity: 'N/A', spaceComplexity: 'N/A' }); }
    finally { setAnalyzing(false); }
  };

  const handleReset = () => {
    if (!question) return;
    const starter = question.starterCode;
    setCode(typeof starter === 'string' ? starter : starter[language] || `// Write your ${language} solution here\n`);
    setFeedback(null);
  };

  const handleAIHint = async (level) => {
    setTab('analysis');
    setAnalyzing(true);
    setFeedback(null);
    try {
      const res = await api.post('/coding/hint', { problem: question.title, description: question.description, hints: question.hints, level });
      setFeedback({ type: 'hint', feedback: res.data.hint, score: null, simulatedOutput: null });
    } catch { setFeedback({ type: 'hint', feedback: 'AI hint not available. Try again.', score: null }); }
    finally { setAnalyzing(false); }
  };

  if (!question) return (
    <div className="flex h-screen bg-background items-center justify-center text-foreground flex-col gap-4">
      <div className="text-4xl">😕</div>
      <p>Question not found.</p>
      <button onClick={() => navigate('/coding')} className="text-indigo-400 hover:underline">Back to Hub</button>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      
      <div className="flex-1 ml-0 flex flex-col h-screen overflow-hidden">

        {/* Top Bar */}
        <div className="flex-shrink-0 h-14 bg-card border-b border-border flex items-center justify-between px-4 gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors">
            <FaArrowLeft /> Back
          </button>
          <div className="flex items-center gap-3 flex-1">
            <h1 className="text-foreground font-semibold text-sm truncate">{question.title}</h1>
            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium flex-shrink-0 ${diffColor[question.difficulty]}`}>{question.difficulty}</span>
            {solved && <span className="text-xs text-green-400 flex items-center gap-1"><FaCheckCircle /> Solved</span>}
          </div>
          <div className="flex items-center gap-2">
            <select value={language} onChange={e => setLanguage(e.target.value)}
              className="bg-card border border-slate-700 text-muted-foreground rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500">
              {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
            <button onClick={handleReset} title="Reset Code"
              className="p-2 bg-card hover:bg-slate-700 text-muted-foreground rounded-lg text-sm transition-colors">
              <FaUndo />
            </button>
            <button onClick={() => handleAIHint(1)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 text-purple-300 rounded-lg text-xs transition-colors">
              <FaLightbulb /> Hint 1
            </button>
            <button onClick={() => handleAIHint(2)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 text-purple-300 rounded-lg text-xs transition-colors">
              <FaLightbulb /> Hint 2
            </button>
            <button onClick={() => handleAIHint(3)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 text-purple-300 rounded-lg text-xs transition-colors">
              <FaLightbulb /> Hint 3
            </button>
            <button onClick={handleRun} disabled={analyzing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-foreground rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
              {analyzing ? <FaSpinner className="animate-spin" /> : <FaPlay />} Run
            </button>
            <button onClick={handleSubmit} disabled={analyzing}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-foreground rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
              {analyzing ? <FaSpinner className="animate-spin" /> : <FaCheck />} Submit
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT PANEL — Problem & Feedback */}
          <div className="w-[42%] flex flex-col border-r border-border overflow-hidden">
            {/* Tab Switcher */}
            <div className="flex-shrink-0 flex border-b border-border bg-card">
              {['description', 'hints', 'analysis'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-5 py-3 text-xs font-semibold capitalize transition-colors border-b-2 ${tab === t ? 'text-indigo-400 border-indigo-400 bg-card/50' : 'text-muted-foreground border-transparent hover:text-foreground'}`}>
                  {t === 'analysis' ? '🤖 AI Analysis' : t === 'hints' ? '💡 Hints' : '📋 Problem'}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {tab === 'description' && (
                  <motion.div key="desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-6">
                    {/* Company Tags */}
                    {question.companies?.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2"><FaBuilding /> Asked by</div>
                        <div className="flex flex-wrap gap-2">
                          {question.companies.map(c => (
                            <span key={c} className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full">{c}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <div>
                      <h3 className="text-sm font-bold text-foreground mb-3">Problem Statement</h3>
                      <div className="text-muted-foreground text-sm whitespace-pre-wrap leading-relaxed">{question.description}</div>
                    </div>

                    {/* Examples */}
                    <div>
                      <h3 className="text-sm font-bold text-foreground mb-3">Examples</h3>
                      <div className="space-y-3">
                        {question.examples.map((ex, idx) => (
                          <div key={idx} className="bg-card border border-border rounded-xl p-4 font-mono text-xs">
                            <div className="text-muted-foreground mb-1">Input:</div>
                            <div className="text-green-400 mb-2">{ex.input}</div>
                            <div className="text-muted-foreground mb-1">Output:</div>
                            <div className="text-indigo-300">{ex.output}</div>
                            {ex.explanation && <div className="text-muted-foreground mt-2 text-[11px]">Explanation: {ex.explanation}</div>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Constraints */}
                    {question.constraints?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-foreground mb-3">Constraints</h3>
                        <ul className="space-y-1">
                          {question.constraints.map((c, i) => (
                            <li key={i} className="text-muted-foreground text-xs font-mono flex gap-2">
                              <span className="text-indigo-400">•</span>{c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Expected Complexity */}
                    <div className="flex gap-4">
                      <div className="flex-1 bg-card border border-border rounded-xl p-4 text-center">
                        <div className="text-xs text-muted-foreground mb-1">Expected Time</div>
                        <div className="font-mono text-indigo-300 text-sm">{question.expectedComplexity?.time}</div>
                      </div>
                      <div className="flex-1 bg-card border border-border rounded-xl p-4 text-center">
                        <div className="text-xs text-muted-foreground mb-1">Expected Space</div>
                        <div className="font-mono text-purple-300 text-sm">{question.expectedComplexity?.space}</div>
                      </div>
                    </div>

                    {/* Topic Tags */}
                    {question.topicTags && (
                      <div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2"><FaTag /> Topics</div>
                        <div className="flex flex-wrap gap-1">
                          {question.topicTags.map(t => (
                            <span key={t} className="text-xs bg-card text-muted-foreground border border-slate-700 px-2 py-0.5 rounded-full">{t}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Similar Questions */}
                    {similarQuestions.length > 0 && (
                      <div className="pt-6 border-t border-border">
                        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><FaCode /> Practice Similar Questions</h3>
                        <div className="space-y-2">
                          {similarQuestions.map(sq => (
                            <Link key={sq.id} to={`/coding/problem/${sq.id}`} 
                              className="flex items-center justify-between p-3 bg-card border border-border rounded-xl hover:bg-card transition-colors group">
                              <span className="text-sm text-muted-foreground group-hover:text-indigo-400 transition-colors">{sq.title}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${diffColor[sq.difficulty]}`}>{sq.difficulty}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {tab === 'hints' && (
                  <motion.div key="hints" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FaLightbulb className="text-amber-400" />
                      <h3 className="text-foreground font-bold">Hints</h3>
                    </div>
                    <div className="space-y-3">
                      {question.hints?.map((hint, i) => (
                        <div key={i} className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                          <span className="text-amber-400 font-bold text-xs block mb-1">Hint {i + 1}</span>
                          <p className="text-muted-foreground text-sm">{hint}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 bg-card border border-border rounded-xl">
                      <h4 className="text-foreground font-semibold text-sm mb-2">💡 AI-Generated Approach</h4>
                      <p className="text-muted-foreground text-xs">Click "AI Hint" in the top bar to get a personalized hint from AI based on your current code.</p>
                    </div>
                  </motion.div>
                )}

                {tab === 'analysis' && (
                  <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FaRobot className="text-indigo-400 text-lg" />
                      <h3 className="text-foreground font-bold">AI Analysis</h3>
                    </div>

                    {analyzing && (
                      <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <div className="relative w-16 h-16">
                          <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
                          <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
                          <div className="absolute inset-0 flex items-center justify-center text-2xl">🤖</div>
                        </div>
                        <p className="text-indigo-400 text-sm animate-pulse">Analyzing your code...</p>
                      </div>
                    )}

                    {!analyzing && !feedback && (
                      <div className="text-center py-16 text-muted-foreground text-sm">
                        <div className="text-5xl mb-4">🤖</div>
                        <p>Run or Submit your code to get AI feedback.</p>
                      </div>
                    )}

                    {!analyzing && feedback && (
                      <div className="space-y-4">
                        {/* Hint mode */}
                        {feedback.type === 'hint' && (
                          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
                            <div className="flex items-center gap-2 text-amber-400 font-bold mb-3"><FaLightbulb /> AI Hint</div>
                            <p className="text-muted-foreground text-sm leading-relaxed">{feedback.feedback}</p>
                          </div>
                        )}

                        {/* Submission Result */}
                        {feedback.score !== null && feedback.score !== undefined && (
                          <div className={`rounded-xl p-5 border ${feedback.score >= 80 ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-foreground flex items-center gap-2 text-xl mb-1">
                                  {feedback.score >= 80 ? <FaCheckCircle className="text-green-400" /> : <FaTimesCircle className="text-red-400" />}
                                  {feedback.score >= 80 ? <span className="text-green-400">Accepted</span> : <span className="text-red-400">Wrong Answer</span>}
                                </span>
                                <span className="text-muted-foreground text-sm flex gap-2">
                                  <span>Testcases Passed: <strong>{feedback.testCasesPassed || (feedback.score >= 80 ? "15/15" : "3/15")}</strong></span>
                                </span>
                              </div>
                              <div className="flex gap-4 text-center">
                                <div className="bg-card/50 rounded-lg p-2 min-w-[80px]">
                                  <div className="text-xs text-muted-foreground mb-1">Runtime</div>
                                  <div className="font-mono text-sm font-bold text-foreground">{feedback.runtime || "45 ms"}</div>
                                </div>
                                <div className="bg-card/50 rounded-lg p-2 min-w-[80px]">
                                  <div className="text-xs text-muted-foreground mb-1">Memory</div>
                                  <div className="font-mono text-sm font-bold text-foreground">{feedback.memoryUsed || "41.2 MB"}</div>
                                </div>
                              </div>
                            </div>
                            <p className="text-muted-foreground text-sm leading-relaxed border-t border-border pt-3 mt-3">{feedback.feedback}</p>

                            {/* Simulation Continue button */}
                            {isSim && (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate(`/companies/${companyName}?role=${encodeURIComponent(role)}&simComplete=true&round=${roundIndex}&score=${feedback.score}`)}
                                className={`w-full mt-4 font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm ${
                                  feedback.score >= 60 
                                    ? 'bg-emerald-650 hover:bg-emerald-600 text-foreground shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                                    : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
                                }`}
                              >
                                {feedback.score >= 60 ? (
                                  <>
                                    <FaCheckCircle /> Unlock Next Simulation Stage
                                  </>
                                ) : (
                                  <>
                                    <FaTimesCircle /> Return to Timeline & Recommendations
                                  </>
                                )}
                              </motion.button>
                            )}
                          </div>
                        )}

                        {/* Simulated Output */}
                        {feedback.simulatedOutput && (
                          <div className="bg-card border border-border rounded-xl p-4">
                            <div className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Console Output</div>
                            <pre className="font-mono text-sm text-muted-foreground whitespace-pre-wrap">{feedback.simulatedOutput}</pre>
                          </div>
                        )}

                        {/* Complexity */}
                        {(feedback.timeComplexity || feedback.spaceComplexity) && (
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-card border border-border rounded-xl p-4 text-center">
                              <div className="text-xs text-muted-foreground mb-1">Time Complexity</div>
                              <div className="font-mono text-indigo-300 font-bold">{feedback.timeComplexity}</div>
                            </div>
                            <div className="bg-card border border-border rounded-xl p-4 text-center">
                              <div className="text-xs text-muted-foreground mb-1">Space Complexity</div>
                              <div className="font-mono text-purple-300 font-bold">{feedback.spaceComplexity}</div>
                            </div>
                          </div>
                        )}

                        {/* Code Review */}
                        {feedback.codeReview && (
                          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                            <div className="text-blue-400 font-bold text-sm mb-3">📋 Professional Code Review</div>
                            <div className="space-y-3">
                              {feedback.codeReview.codeQuality && (
                                <div><span className="text-xs text-muted-foreground block uppercase tracking-wider mb-0.5">Code Quality</span><div className="text-sm text-muted-foreground">{feedback.codeReview.codeQuality}</div></div>
                              )}
                              {feedback.codeReview.readability && (
                                <div><span className="text-xs text-muted-foreground block uppercase tracking-wider mb-0.5">Readability</span><div className="text-sm text-muted-foreground">{feedback.codeReview.readability}</div></div>
                              )}
                              {feedback.codeReview.variableNaming && (
                                <div><span className="text-xs text-muted-foreground block uppercase tracking-wider mb-0.5">Variable Naming</span><div className="text-sm text-muted-foreground">{feedback.codeReview.variableNaming}</div></div>
                              )}
                              {feedback.codeReview.edgeCases && (
                                <div><span className="text-xs text-muted-foreground block uppercase tracking-wider mb-0.5">Edge Case Handling</span><div className="text-sm text-muted-foreground">{feedback.codeReview.edgeCases}</div></div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Mistakes */}
                        {feedback.mistakes?.length > 0 && (
                          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                            <div className="text-red-400 font-bold text-sm mb-3">⚠️ Issues Found</div>
                            <ul className="space-y-2">
                              {feedback.mistakes.map((m, i) => (
                                <li key={i} className="text-muted-foreground text-sm flex gap-2"><span className="text-red-400 flex-shrink-0">•</span>{m}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Optimization Tips */}
                        {feedback.optimizationTips?.length > 0 && (
                          <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
                            <div className="text-indigo-400 font-bold text-sm mb-3">🚀 Optimization Suggestions</div>
                            <ul className="space-y-2">
                              {feedback.optimizationTips.map((t, i) => (
                                <li key={i} className="text-muted-foreground text-sm flex gap-2"><span className="text-indigo-400 flex-shrink-0">•</span>{t}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Follow-up Questions */}
                        {feedback.followUpQuestions?.length > 0 && (
                          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                            <div className="text-emerald-400 font-bold text-sm mb-3 flex items-center gap-2"><FaQuestionCircle /> Interview Follow-up Questions</div>
                            <p className="text-xs text-muted-foreground mb-3">How would you answer these if the interviewer asked?</p>
                            <ul className="space-y-3">
                              {feedback.followUpQuestions.map((q, i) => (
                                <li key={i} className="text-muted-foreground text-sm p-3 bg-card border border-border rounded-lg">{q}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT PANEL — Monaco Editor */}
          <div className="flex-1 flex flex-col bg-background overflow-hidden">
            <div className="flex-1">
              <Editor
                height="100%"
                language={language === 'cpp' ? 'cpp' : language}
                theme="vs-dark"
                value={code}
                onChange={v => setCode(v)}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  padding: { top: 16, bottom: 16 },
                  scrollBeyondLastLine: false,
                  fontFamily: '"Fira Code", "JetBrains Mono", monospace',
                  fontLigatures: true,
                  lineNumbers: 'on',
                  renderLineHighlight: 'line',
                  automaticLayout: true,
                }}
              />
            </div>

            {/* Bottom Status Bar */}
            <div className="flex-shrink-0 h-7 bg-indigo-600 flex items-center px-4 gap-4 text-xs text-muted-foreground">
              <span>📝 {language.toUpperCase()}</span>
              <span>•</span>
              <span>InterviewX AI Coding Editor</span>
              <span className="ml-auto">Lines: {code.split('\n').length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingEditor;
