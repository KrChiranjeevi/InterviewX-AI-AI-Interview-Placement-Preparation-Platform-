import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCloudUploadAlt, FaFilePdf, FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaArrowRight, FaChartBar, FaBuilding, FaBriefcase } from 'react-icons/fa';
import api from '../services/api';

const ResumeAnalyzer = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const roles = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Java Developer',
    'Python Developer', 'React Developer', 'Node.js Developer', 'Data Scientist',
    'Data Analyst', 'Machine Learning Engineer', 'AI Engineer', 'DevOps Engineer',
    'Cloud Engineer', 'Cyber Security', 'Mobile App Developer', 'UI/UX Designer',
    'Software Engineer', 'SDE Intern', 'Other'
  ];

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
      } else {
        alert('Please upload a PDF file.');
      }
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert('Please upload a resume first.');
    if (!targetRole) return alert('Please select a Target Job Role.');
    
    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('targetRole', targetRole);

    try {
      const res = await api.post('/resume/upload', formData);
      setAnalysis(res.data);
    } catch (error) {
      console.error(error);
      alert('Failed to analyze resume. Make sure your OpenAI API key is set in the backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <Navbar title="Resume Analyzer" subtitle="Upload your resume to get AI feedback and score." />
        
        <main className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {!analysis && !loading && (
              <motion.div 
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-3xl mx-auto mt-10"
              >
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 relative overflow-hidden ${
                    isDragging 
                      ? 'border-indigo-500 bg-indigo-500/10' 
                      : 'border-slate-700 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-600'
                  }`}
                >
                  <FaCloudUploadAlt className={`mx-auto text-7xl mb-6 transition-colors ${isDragging ? 'text-indigo-400' : 'text-slate-600'}`} />
                  <h3 className="text-2xl font-bold text-white mb-2">Drag & Drop your Resume</h3>
                  <p className="text-slate-400 mb-8">Supported formats: PDF (Max 5MB)</p>
                  
                  <div className="mb-8 max-w-sm mx-auto text-left">
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
                      <FaBriefcase className="mr-2" /> Target Job Role
                    </label>
                    <select
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select a role...</option>
                      {roles.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  
                  <input 
                    type="file" 
                    id="resume-upload" 
                    className="hidden" 
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                  <label 
                    htmlFor="resume-upload"
                    className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium cursor-pointer border border-slate-700 transition-colors inline-block"
                  >
                    Browse Files
                  </label>
                  
                  {file && (
                    <div className="mt-8 flex items-center justify-center p-4 bg-slate-950 rounded-xl border border-slate-800">
                      <FaFilePdf className="text-red-400 text-2xl mr-3" />
                      <span className="text-slate-200 font-medium mr-4">{file.name}</span>
                      <button 
                        onClick={handleUpload}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                      >
                        Analyze Now
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center"
              >
                <div className="relative w-32 h-32 mb-8">
                  <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-4xl">🤖</div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">AI is analyzing your resume</h3>
                <p className="text-indigo-400 animate-pulse">Extracting skills, evaluating experience, generating feedback...</p>
              </motion.div>
            )}

            {analysis && !loading && (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto space-y-8"
              >
                {/* Header Section */}
                <div className="flex flex-col md:flex-row gap-6">
                  {/* ATS Score Card */}
                  <div className="glass-card rounded-3xl p-8 flex-1 border border-indigo-500/20 relative overflow-hidden flex flex-col items-center justify-center">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
                    <h3 className="text-slate-400 font-medium mb-4 relative z-10 text-lg">Overall ATS Score</h3>
                    <div className="relative z-10 mb-4">
                      <div className="w-40 h-40 rounded-full border-8 border-slate-800 flex items-center justify-center relative">
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                          <circle cx="72" cy="72" r="68" fill="none" stroke={analysis.score >= 70 ? "#22c55e" : analysis.score >= 40 ? "#f59e0b" : "#ef4444"} strokeWidth="8" strokeDasharray="427" strokeDashoffset={427 - (427 * analysis.score) / 100} className="transition-all duration-1000 ease-out" />
                        </svg>
                        <div className="flex flex-col items-center">
                          <span className="text-4xl font-bold text-white">{analysis.score}</span>
                          <span className="text-sm text-slate-500">/100</span>
                        </div>
                      </div>
                    </div>
                    <p className={`text-sm font-medium z-10 ${analysis.score >= 70 ? "text-green-400" : analysis.score >= 40 ? "text-amber-400" : "text-red-400"}`}>
                      {analysis.score >= 70 ? 'Excellent match for ' : analysis.score >= 40 ? 'Average match for ' : 'Poor match for '} 
                      <span className="text-white">{analysis.targetRole || targetRole}</span>
                    </p>
                  </div>

                  {/* Skill Match & Next Steps */}
                  <div className="glass-card rounded-3xl p-8 flex-[1.5] flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                        <FaChartBar className="mr-3 text-indigo-400" /> Skill Match Percentage
                      </h3>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-slate-400">Match Rate</span>
                        <span className="text-white font-bold">{analysis.skillMatchPercentage}%</span>
                      </div>
                      <div className="h-4 bg-slate-800 rounded-full overflow-hidden mb-8">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${analysis.skillMatchPercentage}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white mb-3">Ready to Practice?</h3>
                      <p className="text-slate-400 mb-5 text-sm">Take a mock interview tailored exactly to the skills and projects mentioned in this resume.</p>
                      <button 
                        onClick={() => navigate('/interview/setup', { state: { resumeSkills: analysis.skillsFound, resumeText: analysis.resumeText } })}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-colors">
                        Generate Role-Based Interview <FaArrowRight className="ml-2" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Company Compatibility */}
                <div className="glass-card rounded-3xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <FaBuilding className="mr-3 text-indigo-400" /> Top Company Compatibility
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {analysis.companyCompatibility?.map((comp, idx) => (
                      <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-white font-bold mb-2">{comp.company}</span>
                        <div className="flex items-center w-full gap-2">
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${comp.matchPercent >= 70 ? 'bg-green-500' : comp.matchPercent >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${comp.matchPercent}%` }}></div>
                          </div>
                          <span className="text-xs text-slate-400">{comp.matchPercent}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Keywords Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-card rounded-3xl p-6 border-t-4 border-t-green-500">
                    <h4 className="font-bold text-white mb-4 flex items-center"><FaCheckCircle className="text-green-500 mr-2" /> Matched Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.matchedKeywords?.length > 0 ? analysis.matchedKeywords.map((k, i) => (
                        <span key={i} className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-xs">{k}</span>
                      )) : <span className="text-slate-500 text-sm">No matched keywords</span>}
                    </div>
                  </div>
                  
                  <div className="glass-card rounded-3xl p-6 border-t-4 border-t-red-500">
                    <h4 className="font-bold text-white mb-4 flex items-center"><FaExclamationTriangle className="text-red-500 mr-2" /> Missing Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.missingSkills?.length > 0 ? analysis.missingSkills.map((k, i) => (
                        <span key={i} className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">{k}</span>
                      )) : <span className="text-slate-500 text-sm">None missing</span>}
                    </div>
                  </div>

                  <div className="glass-card rounded-3xl p-6 border-t-4 border-t-indigo-500">
                    <h4 className="font-bold text-white mb-4 flex items-center"><FaLightbulb className="text-indigo-400 mr-2" /> Priority / Recommended</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.priorityKeywords?.length > 0 ? analysis.priorityKeywords.map((k, i) => (
                        <span key={i} className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400 text-xs">{k}</span>
                      )) : <span className="text-slate-500 text-sm">N/A</span>}
                    </div>
                  </div>
                </div>

                {/* Detailed Report */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div className="glass-card rounded-3xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">Strengths</h3>
                      <ul className="list-disc list-inside space-y-2 text-slate-300 text-sm">
                        {analysis.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div className="glass-card rounded-3xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">Weaknesses</h3>
                      <ul className="list-disc list-inside space-y-2 text-slate-300 text-sm">
                        {analysis.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                    <div className="glass-card rounded-3xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">Section Analysis</h3>
                      <div className="space-y-4 text-sm">
                        <div><strong className="text-indigo-400">Structure:</strong> <span className="text-slate-300">{analysis.resumeStructure}</span></div>
                        <div><strong className="text-indigo-400">Projects:</strong> <span className="text-slate-300">{analysis.projectQuality}</span></div>
                        <div><strong className="text-indigo-400">Experience:</strong> <span className="text-slate-300">{analysis.experienceAnalysis}</span></div>
                        <div><strong className="text-indigo-400">Education:</strong> <span className="text-slate-300">{analysis.educationAnalysis}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div className="glass-card rounded-3xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2 flex items-center">
                        <FaLightbulb className="mr-2 text-amber-400" /> Actionable Recommendations
                      </h3>
                      <div className="space-y-4">
                        {analysis.recommendations?.map((rec, i) => (
                          <div key={i} className="flex items-start bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                            <span className="text-amber-400 font-bold mr-3 mt-0.5">{i + 1}.</span>
                            <p className="text-slate-300 text-sm">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="glass-card rounded-3xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">Formatting & Parsing</h3>
                      <ul className="list-disc list-inside space-y-2 text-slate-300 text-sm">
                        {analysis.formattingIssues?.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                      <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                        <strong className="text-indigo-400 block mb-1">Keyword Density:</strong>
                        <span className="text-slate-300 text-sm">{analysis.keywordDensity}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
