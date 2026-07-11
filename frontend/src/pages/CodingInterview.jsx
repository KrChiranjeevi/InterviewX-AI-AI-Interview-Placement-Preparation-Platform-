import { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from '../components/layout/Sidebar';
import { motion } from 'framer-motion';
import { FaPlay, FaCheck, FaLightbulb, FaRobot, FaTimesCircle, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import Editor from '@monaco-editor/react';

const CodingInterview = () => {
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('// Write your solution here\n');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(true);
  
  // AI Feedback state
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await api.get('/coding/problem');
        setProblem(res.data);
      } catch (err) {
        console.error('Failed to fetch coding problem', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, []);

  const handleRunCode = async () => {
    setAnalyzing(true);
    setFeedback(null);
    try {
      const res = await api.post('/coding/run', {
        problem: problem.title,
        code,
        language
      });
      setFeedback(res.data);
    } catch (err) {
      console.error('Failed to run code', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmitSolution = async () => {
    setAnalyzing(true);
    setFeedback(null);
    try {
      const res = await api.post('/coding/submit', {
        problem: problem.title,
        code,
        language
      });
      setFeedback(res.data);
    } catch (err) {
      console.error('Failed to submit code', err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading || !problem) return (
    <div className="flex bg-slate-950 min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="flex bg-slate-950 text-slate-200 min-h-screen font-sans overflow-hidden h-screen">
      <Sidebar />
      
      <div className="flex-1 ml-64 flex flex-col md:flex-row h-full">
        {/* Left Panel: Problem Description & AI Feedback */}
        <div className="w-full md:w-1/3 border-r border-slate-800 flex flex-col h-full overflow-y-auto bg-slate-900">
          <div className="p-6 border-b border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-white">{problem.title}</h1>
              <span className="px-3 py-1 rounded-full text-xs font-medium border bg-green-500/10 text-green-400 border-green-500/20">
                {problem.difficulty}
              </span>
            </div>
            
            <div className="prose prose-invert max-w-none text-slate-300 text-sm whitespace-pre-wrap">
              {problem.description}
            </div>
            
            <h3 className="text-lg font-bold text-white mt-6 mb-2">Examples</h3>
            <div className="space-y-4 text-sm">
              {problem.examples.map((ex, idx) => (
                <div key={idx} className="bg-slate-800 p-4 rounded-lg font-mono">
                  <div><span className="text-slate-400">Input:</span> {ex.input}</div>
                  <div><span className="text-slate-400">Output:</span> {ex.output}</div>
                </div>
              ))}
            </div>

            <h3 className="text-lg font-bold text-white mt-6 mb-2">Constraints</h3>
            <ul className="list-disc list-inside text-slate-300 text-sm font-mono space-y-1">
              {problem.constraints.map((c, idx) => (
                <li key={idx}>{c}</li>
              ))}
            </ul>
          </div>

          {/* AI Feedback Panel */}
          <div className="flex-1 p-6 bg-slate-900/50">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <FaRobot className="text-indigo-400 mr-2" /> AI Interviewer
            </h3>

            {analyzing ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <FaSpinner className="animate-spin text-3xl text-indigo-500" />
                <p className="text-slate-400">Evaluating Code & Logic...</p>
              </div>
            ) : feedback ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-slate-300">Simulated Output</span>
                    {feedback.score > 80 ? <FaCheckCircle className="text-green-400" /> : <FaTimesCircle className="text-red-400" />}
                  </div>
                  <pre className="font-mono text-sm text-slate-300 whitespace-pre-wrap">{feedback.simulatedOutput}</pre>
                </div>

                {feedback.score && (
                  <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-white">Evaluation Score</span>
                      <span className="text-xl font-black text-indigo-400">{feedback.score}/100</span>
                    </div>
                    <p className="text-sm text-slate-300">{feedback.feedback}</p>
                    
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="bg-slate-800 p-2 rounded text-center">
                        <div className="text-xs text-slate-400">Time Complexity</div>
                        <div className="font-mono text-sm text-indigo-300">{feedback.timeComplexity}</div>
                      </div>
                      <div className="bg-slate-800 p-2 rounded text-center">
                        <div className="text-xs text-slate-400">Space Complexity</div>
                        <div className="font-mono text-sm text-indigo-300">{feedback.spaceComplexity}</div>
                      </div>
                    </div>
                  </div>
                )}

                {feedback.mistakes && feedback.mistakes.length > 0 && (
                  <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg text-sm text-red-200">
                    <span className="font-bold block mb-2">Bugs & Mistakes:</span>
                    <ul className="list-disc list-inside space-y-1">
                      {feedback.mistakes.map((m, i) => <li key={i}>{m}</li>)}
                    </ul>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="text-slate-500 text-sm text-center py-10">
                Run or submit your code to get real-time feedback from the AI interviewer.
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Code Editor */}
        <div className="w-full md:w-2/3 flex flex-col h-full bg-[#1e1e1e]">
          <div className="h-14 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-900">
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-300 rounded px-3 py-1 text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>

            <div className="flex gap-3">
              <button 
                onClick={handleRunCode}
                disabled={analyzing}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-1.5 rounded text-sm font-medium flex items-center transition-colors disabled:opacity-50"
              >
                <FaPlay className="mr-2 text-xs" /> Run Code
              </button>
              <button 
                onClick={handleSubmitSolution}
                disabled={analyzing}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded text-sm font-medium flex items-center transition-colors disabled:opacity-50"
              >
                <FaCheck className="mr-2 text-xs" /> Submit Solution
              </button>
            </div>
          </div>

          <div className="flex-1">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value)}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                padding: { top: 16 },
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingInterview;
