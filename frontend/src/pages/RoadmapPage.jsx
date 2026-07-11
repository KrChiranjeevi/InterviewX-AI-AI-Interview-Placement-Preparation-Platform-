import React, { useState, useEffect } from 'react';
import { getRoadmap, generateRoadmap, toggleRoadmapTask } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

const RoadmapPage = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      const { data } = await getRoadmap();
      setRoadmap(data);
      setLoading(false);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setRoadmap(null);
      } else {
        setError('Failed to load roadmap.');
      }
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!targetRole.trim()) return;
    
    setShowModal(false);
    setGenerating(true);
    
    try {
      const { data } = await generateRoadmap(targetRole);
      setRoadmap(data);
    } catch (err) {
      setError('Failed to generate roadmap. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTask = async (weekIndex, taskIndex) => {
    try {
      // Optimistic update
      const updatedRoadmap = { ...roadmap };
      updatedRoadmap.weeks[weekIndex].tasks[taskIndex].completed = !updatedRoadmap.weeks[weekIndex].tasks[taskIndex].completed;
      
      // Calculate new progress locally to update UI immediately
      let totalTasks = 0;
      let completedTasks = 0;
      updatedRoadmap.weeks.forEach(week => {
        week.tasks.forEach(task => {
          totalTasks++;
          if (task.completed) completedTasks++;
        });
      });
      updatedRoadmap.progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
      setRoadmap(updatedRoadmap);

      // Backend update
      await toggleRoadmapTask(roadmap._id, weekIndex, taskIndex);
    } catch (err) {
      console.error('Failed to toggle task', err);
      // Revert if error
      fetchRoadmap();
    }
  };

  if (loading || generating) {
    return (
      <div className="flex h-screen bg-slate-950 items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
          <h2 className="text-2xl font-bold text-white animate-pulse">
            {generating ? 'Crafting your personalized roadmap...' : 'Loading...'}
          </h2>
          {generating && <p className="text-slate-400 mt-2">Analyzing your past performance to find weak spots.</p>}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-slate-950 items-center justify-center">
        <div className="text-red-400 text-xl font-semibold bg-red-900/20 border border-red-500/20 p-8 rounded-xl shadow-md">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <Navbar subtitle="A personalized preparation plan designed dynamically based on your weaknesses." />
        <main className="flex-1 overflow-y-auto p-8 no-scrollbar">
          <div className="max-w-4xl mx-auto">
            
            <div className="mb-10 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight flex flex-col md:flex-row items-center gap-3">
                Your Personalized Learning Roadmap <span className="text-4xl">🚀</span>
              </h1>
            </div>

            {!roadmap ? (
              <div className="glass-card rounded-3xl shadow-xl p-10 md:p-16 text-center border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
                <svg className="mx-auto h-24 w-24 text-indigo-400 mb-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <h3 className="text-3xl font-bold text-white relative z-10">No roadmap generated yet</h3>
                <p className="mt-4 text-lg text-slate-400 max-w-md mx-auto relative z-10">Generate a custom roadmap to focus on the skills you need to land your dream job.</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-8 relative z-10 inline-flex items-center px-8 py-4 border border-transparent text-lg font-bold rounded-full shadow-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105"
                >
                  Generate Roadmap Now
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                {/* Header Info */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-3xl p-8 border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex flex-col space-y-4 w-full md:w-1/2">
                    <div className="flex items-center space-x-3">
                      <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-400 uppercase tracking-wide">Current Target</p>
                        <p className="text-xl font-bold text-white">{roadmap.targetRole}</p>
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Overall Progress</p>
                      <p className="text-3xl font-black text-indigo-400">{roadmap.progress}%</p>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3 mb-1">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: `${roadmap.progress}%` }}></div>
                    </div>
                  </div>
                </motion.div>

                {/* Timeline */}
                <div className="relative pl-4 md:pl-0">
                  <div className="hidden md:block absolute left-8 top-0 bottom-0 w-1 bg-slate-800 rounded-full"></div>
                  
                  <div className="space-y-8">
                    {roadmap.weeks.map((week, weekIndex) => {
                      const weekCompleted = week.tasks.every(t => t.completed);
                      
                      return (
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: weekIndex * 0.1 }}
                          key={weekIndex} 
                          className="relative md:pl-20"
                        >
                          {/* Timeline dot */}
                          <div className={`hidden md:flex absolute left-6 w-5 h-5 rounded-full mt-6 -ml-0.5 border-4 border-slate-950 shadow ${weekCompleted ? 'bg-green-500' : 'bg-slate-700'}`}></div>
                          
                          <div className={`glass-card rounded-3xl shadow-sm border ${weekCompleted ? 'border-green-500/30' : 'border-slate-800'} p-6 transition-all hover:border-indigo-500/50`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                              <h3 className="text-2xl font-bold text-white">{week.title}</h3>
                              {weekCompleted && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-500/20 text-green-400">
                                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                  Completed
                                </span>
                              )}
                            </div>
                            
                            <div className="mb-6">
                              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Focus Topics</p>
                              <div className="flex flex-wrap gap-2">
                                {week.topics.map((topic, i) => (
                                  <span key={i} className="px-3 py-1.5 bg-slate-800/80 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium">
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Tasks</p>
                              <ul className="space-y-3">
                                {week.tasks.map((task, taskIndex) => (
                                  <li key={taskIndex} className="flex items-start bg-slate-900/50 p-4 rounded-xl border border-slate-800 hover:border-indigo-500/30 transition-colors cursor-pointer" onClick={() => handleToggleTask(weekIndex, taskIndex)}>
                                    <div className="flex-shrink-0 mt-0.5 relative flex items-center justify-center">
                                      <input
                                        type="checkbox"
                                        className="peer h-5 w-5 rounded bg-slate-800 border-slate-600 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer appearance-none checked:bg-indigo-500 checked:border-transparent transition-all"
                                        checked={task.completed}
                                        onChange={() => handleToggleTask(weekIndex, taskIndex)}
                                      />
                                      <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                    <span className={`ml-4 block text-base ${task.completed ? 'text-slate-500 line-through' : 'text-slate-200 font-medium'}`}>
                                      {task.title}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="text-center mt-12 mb-8">
                  <button onClick={() => setShowModal(true)} className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm underline underline-offset-4">
                    Generate a new roadmap
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Generate Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={() => setShowModal(false)}></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative z-10 inline-block align-bottom bg-slate-900 border border-slate-800 rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                <form onSubmit={handleGenerate}>
                  <div className="px-8 pt-8 pb-6">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-indigo-500/20 sm:mx-0 sm:h-12 sm:w-12">
                        <span className="text-2xl">🎯</span>
                      </div>
                      <div className="mt-3 text-center sm:mt-0 sm:ml-6 sm:text-left w-full">
                        <h3 className="text-2xl leading-6 font-bold text-white" id="modal-title">What's your target role?</h3>
                        <div className="mt-4 w-full">
                          <input
                            type="text"
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500/20 px-4 py-3 font-medium placeholder-slate-500 outline-none transition-all"
                            placeholder="e.g. Amazon SDE, Frontend Engineer"
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            required
                            autoFocus
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-900/50 px-8 py-5 sm:flex sm:flex-row-reverse border-t border-slate-800">
                    <button type="submit" className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-6 py-3 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-500 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-colors">
                      Generate Plan
                    </button>
                    <button type="button" onClick={() => setShowModal(false)} className="mt-3 w-full inline-flex justify-center rounded-xl border border-slate-700 shadow-sm px-6 py-3 bg-slate-800 text-base font-medium text-slate-300 hover:bg-slate-700 hover:text-white focus:outline-none sm:mt-0 sm:w-auto sm:text-sm transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoadmapPage;
