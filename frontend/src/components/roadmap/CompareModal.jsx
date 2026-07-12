import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaBalanceScale, FaTrophy } from 'react-icons/fa';
import { compareRoadmaps } from '../../services/api';

const CompareModal = ({ isOpen, onClose }) => {
  const [topic1, setTopic1] = useState('');
  const [topic2, setTopic2] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleCompare = async (e) => {
    e.preventDefault();
    if (!topic1 || !topic2) return;
    setLoading(true);
    try {
      const { data } = await compareRoadmaps(topic1, topic2);
      setResult(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-4xl w-full relative overflow-y-auto max-h-[90vh] no-scrollbar shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white">
          <FaTimes className="text-xl" />
        </button>
        
        <div className="text-center mb-8">
          <FaBalanceScale className="text-4xl text-indigo-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">Compare Career Paths</h2>
          <p className="text-slate-400 text-sm mt-2">Which path is right for you? Compare difficulty, salary, and growth.</p>
        </div>

        {!result ? (
          <form onSubmit={handleCompare} className="max-w-xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <input 
                type="text" 
                placeholder="e.g. Java Developer" 
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 text-center text-lg font-semibold"
                value={topic1} onChange={e => setTopic1(e.target.value)} required 
              />
              <span className="text-slate-500 font-bold italic">VS</span>
              <input 
                type="text" 
                placeholder="e.g. Python Developer" 
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 text-center text-lg font-semibold"
                value={topic2} onChange={e => setTopic2(e.target.value)} required 
              />
            </div>
            <button type="submit" disabled={loading} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:opacity-50">
              {loading ? 'Analyzing Data...' : 'Compare Now'}
            </button>
          </form>
        ) : (
          <div className="space-y-8 animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="p-4 border-b border-slate-800 text-slate-400 font-medium">Metric</th>
                    <th className="p-4 border-b border-slate-800 text-white font-bold text-lg text-center w-2/5">{topic1}</th>
                    <th className="p-4 border-b border-slate-800 text-white font-bold text-lg text-center w-2/5">{topic2}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.comparison.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 border-b border-slate-800 text-slate-300 font-medium">{row.metric}</td>
                      <td className={`p-4 border-b border-slate-800 text-center ${row.winner === 'topic1' ? 'text-green-400 font-bold bg-green-500/5' : 'text-slate-400'}`}>
                        {row.winner === 'topic1' && <FaTrophy className="inline mr-2 text-amber-400" />}
                        {row.topic1Value}
                      </td>
                      <td className={`p-4 border-b border-slate-800 text-center ${row.winner === 'topic2' ? 'text-green-400 font-bold bg-green-500/5' : 'text-slate-400'}`}>
                        {row.winner === 'topic2' && <FaTrophy className="inline mr-2 text-amber-400" />}
                        {row.topic2Value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6">
              <h3 className="text-indigo-400 font-bold mb-3 text-lg">AI Verdict</h3>
              <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">{result.summary}</p>
            </div>

            <div className="text-center">
              <button onClick={() => setResult(null)} className="px-6 py-2 bg-slate-800 text-white rounded-full hover:bg-slate-700 transition-colors text-sm">
                Compare Something Else
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CompareModal;
