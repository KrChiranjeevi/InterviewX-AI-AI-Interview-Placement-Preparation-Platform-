import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReports } from '../services/api';
import { motion } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

const ReportsDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await getReports();
        setReports(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load reports');
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-950 items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-slate-950 items-center justify-center">
        <div className="text-red-400 text-xl font-semibold bg-red-900/20 border border-red-500/20 p-6 rounded-lg shadow">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <Navbar subtitle="Analyze your past interviews and track your progress." />
        <main className="flex-1 overflow-y-auto p-8 no-scrollbar">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Your AI Performance Reports</h1>
              </div>
            </div>

            {reports.length === 0 ? (
              <div className="glass-card rounded-2xl p-10 text-center border border-slate-800">
                <svg className="mx-auto h-16 w-16 text-slate-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl font-medium text-white">No reports found</h3>
                <p className="mt-1 text-slate-400">You haven't completed any interviews yet.</p>
                <div className="mt-6">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none transition-colors duration-200"
                  >
                    Start an Interview
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {reports.map((report, index) => (
                  <motion.div
                    key={report._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="glass-card rounded-2xl shadow-lg border border-slate-800 overflow-hidden flex flex-col h-full hover:border-indigo-500/50 transition-all duration-300"
                  >
                    <div className="p-6 flex-grow">
                      <div className="flex justify-between items-start mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-indigo-500/20 text-indigo-300">
                          {report.interviewId?.type || 'Interview'}
                        </span>
                        <span className="text-sm font-medium text-slate-400">
                          {new Date(report.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">{report.interviewId?.role || 'Unknown Role'}</h3>
                      <div className="mt-6 flex items-end">
                        <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                          {report.overallScore}
                        </div>
                        <div className="ml-2 text-xl font-medium text-slate-500 mb-1">/100</div>
                      </div>
                      <p className="mt-2 text-sm text-slate-400 font-medium">Overall Score</p>
                    </div>
                    <div className="bg-slate-900/50 px-6 py-4 border-t border-slate-800 mt-auto">
                      <button
                        onClick={() => navigate(`/report/${report.interviewId?._id}`)}
                        className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-slate-800 hover:bg-slate-700 transition-colors duration-200"
                      >
                        View Full Report
                        <svg className="ml-2 -mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportsDashboard;
