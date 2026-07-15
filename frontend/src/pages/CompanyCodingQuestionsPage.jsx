import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiCheckCircle, FiStar, FiChevronLeft, FiPlayCircle, 
  FiChevronRight, FiBriefcase, FiX, FiLock, FiBookOpen, FiShare2, FiMessageSquare
} from 'react-icons/fi';
import api from '../services/api';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

const COMPANY_META = {
  Google: { count: 2300, saved: '14,951', gradient: 'from-blue-500 via-red-500 to-yellow-500', logo: 'G' },
  Amazon: { count: 1850, saved: '11,240', gradient: 'from-orange-400 to-yellow-600', logo: 'A' },
  Microsoft: { count: 1540, saved: '9,812', gradient: 'from-teal-400 to-blue-600', logo: 'M' },
  Meta: { count: 1290, saved: '8,419', gradient: 'from-blue-600 to-indigo-700', logo: 'M' },
  Apple: { count: 980, saved: '6,118', gradient: 'from-gray-500 to-slate-800', logo: 'A' },
  Netflix: { count: 720, saved: '4,510', gradient: 'from-red-600 to-rose-900', logo: 'N' },
  Adobe: { count: 540, saved: '3,114', gradient: 'from-red-500 to-orange-500', logo: 'A' },
  Oracle: { count: 480, saved: '2,810', gradient: 'from-red-600 to-red-800', logo: 'O' },
  Infosys: { count: 410, saved: '2,305', gradient: 'from-blue-400 to-indigo-500', logo: 'I' },
  TCS: { count: 390, saved: '2,112', gradient: 'from-purple-500 to-indigo-600', logo: 'T' },
  Accenture: { count: 350, saved: '1,980', gradient: 'from-purple-600 to-pink-500', logo: 'A' },
  Flipkart: { count: 280, saved: '1,540', gradient: 'from-yellow-400 to-blue-500', logo: 'F' },
  PhonePe: { count: 210, saved: '1,120', gradient: 'from-indigo-500 to-purple-600', logo: 'P' },
  Meesho: { count: 180, saved: '920', gradient: 'from-pink-500 to-rose-500', logo: 'M' },
  Uber: { count: 320, saved: '1,840', gradient: 'from-black to-slate-900', logo: 'U' },
  Salesforce: { count: 290, saved: '1,610', gradient: 'from-cyan-400 to-blue-500', logo: 'S' }
};

const FILTER_TOPICS = [
  'All', 'Arrays', 'Strings', 'Hash Table', 'Dynamic Programming', 'Tree', 'Graphs', 'SQL', 'JavaScript', 'Math', 'DFS', 'BFS'
];

const CompanyCodingQuestionsPage = () => {
  const { companyName } = useParams();
  const navigate = useNavigate();
  
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState('All');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const meta = COMPANY_META[companyName] || { count: 200, saved: '1,200', gradient: 'from-indigo-500 to-purple-600', logo: companyName ? companyName.charAt(0) : 'C' };

  useEffect(() => {
    fetchCompanyProblems();
  }, [companyName]);

  const fetchCompanyProblems = async () => {
    try {
      setLoading(true);
      // Query database for questions asked by this specific company
      const { data } = await api.get(`/coding/problems?company=${encodeURIComponent(companyName)}&limit=3000`);
      setProblems(data.problems || []);
    } catch (error) {
      console.error('Failed to load company problems', error);
      // Fallback mock problems
      setProblems([
        { _id: '1', slug: 'two-sum', title: 'Two Sum', difficulty: 'Easy', acceptanceRate: 54.2, topics: ['Arrays', 'Hash Table'], companies: [companyName] },
        { _id: '2', slug: 'add-two-numbers', title: 'Add Two Numbers', difficulty: 'Medium', acceptanceRate: 41.8, topics: ['Linked List', 'Math'], companies: [companyName] },
        { _id: '3', slug: 'longest-substring', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', acceptanceRate: 33.9, topics: ['Hash Table', 'Strings'], companies: [companyName] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Filter problems
  const filteredProblems = problems.filter(prob => {
    const matchesSearch = prob.title.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'All' || prob.difficulty === difficultyFilter;
    const matchesTopic = selectedTopicFilter === 'All' || (prob.topics && prob.topics.includes(selectedTopicFilter));
    return matchesSearch && matchesDifficulty && matchesTopic;
  });

  // Paginated problems
  const totalPages = Math.ceil(filteredProblems.length / itemsPerPage);
  const paginatedProblems = filteredProblems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Hard': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden font-sans relative">
      <Sidebar />

      <div className="relative z-10 flex-1 pl-0 md:pl-[72px] flex flex-col h-screen overflow-hidden">
        <Navbar subtitle={`${companyName} Interview Practice`} />
        <div className="absolute inset-x-0 top-16 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent animate-pulse" />

        <main className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8">
          <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Left Column - Company Meta Card & Sub-navigation */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          {/* Main Card */}
          <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 relative overflow-hidden backdrop-blur-xl shadow-2xl">
            {/* Logo block */}
            <div className="flex items-center space-x-5 mb-6">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${meta.gradient} flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-indigo-500/10 shrink-0`}>
                {meta.logo}
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">{companyName}</h1>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  InterviewX · {meta.count}+ problems
                </p>
              </div>
            </div>

            {/* Subtitle count stats */}
            <div className="text-slate-400 text-xs font-semibold space-y-2 py-3 border-t border-b border-white/5 mb-6">
              <div className="flex justify-between">
                <span>Total Questions</span>
                <span className="text-white font-bold">{meta.count}</span>
              </div>
              <div className="flex justify-between">
                <span>Community Saves</span>
                <span className="text-white font-bold">{meta.saved}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated</span>
                <span className="text-indigo-300">16 hours ago</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button 
                onClick={() => {
                  if (paginatedProblems.length > 0) {
                    navigate(`/coding/problem/${paginatedProblems[0]._id}`);
                  }
                }}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-sm py-3 px-4 rounded-2xl shadow-lg shadow-indigo-500/20 hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <FiPlayCircle className="text-lg animate-pulse" />
                <span>Start Practice</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center space-x-1.5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all">
                  <FiStar />
                  <span>Favorite</span>
                </button>
                <button className="flex items-center justify-center space-x-1.5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all">
                  <FiShare2 />
                  <span>Share</span>
                </button>
              </div>
            </div>

            <a href="#discuss" className="mt-4 flex items-center justify-center space-x-1 text-slate-400 hover:text-indigo-400 text-xs font-bold transition-colors pt-2">
              <FiMessageSquare />
              <span>Discuss Company Interview Prep</span>
            </a>
          </div>

          {/* Sub Navigation Lists */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-4 space-y-1">
            <button className="w-full flex items-center space-x-3 px-4 py-3 bg-indigo-500/10 text-indigo-300 rounded-xl text-xs font-bold border border-indigo-500/10">
              <FiBriefcase className="text-sm" />
              <span>Interview Library</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl text-xs font-bold transition-all">
              <FiBookOpen className="text-sm" />
              <span>Quest & Study Plans</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl text-xs font-bold transition-all">
              <FiStar className="text-sm" />
              <span>Saved Favorite Sets</span>
            </button>
          </div>
        </div>

        {/* Right Column - Filters & Questions List */}
        <div className="flex-1 space-y-6">
          
          {/* Header & Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg" />
              <input
                type="text"
                placeholder="Search company coding questions..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full bg-white/[0.03] border border-white/5 pl-12 pr-4 py-3.5 rounded-2xl text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 placeholder-slate-500 transition-all font-medium text-white"
              />
            </div>
            
            {/* Difficulty filter badges */}
            <div className="flex items-center space-x-2 bg-white/[0.02] border border-white/5 p-1.5 rounded-2xl self-start md:self-auto">
              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => { setDifficultyFilter(diff); setCurrentPage(1); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
                    difficultyFilter === diff
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Filters Row */}
          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl flex flex-wrap gap-2 overflow-x-auto custom-scrollbar whitespace-nowrap shrink-0">
            {FILTER_TOPICS.map(topic => (
              <button
                key={topic}
                onClick={() => { setSelectedTopicFilter(topic); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 ${
                  selectedTopicFilter === topic
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 scale-105'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>

          {/* Problems List Table */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider animate-pulse">Loading Questions...</span>
              </div>
            ) : filteredProblems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FiX className="text-slate-500 text-4xl mb-4" />
                <h3 className="text-white font-bold text-lg">No Questions Found</h3>
                <p className="text-slate-500 text-sm mt-1">Try modifying your filters or search keywords.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                      <th className="py-4 pl-6 w-12 text-center">Status</th>
                      <th className="py-4 px-4">Title</th>
                      <th className="py-4 px-4 w-28 text-center">Acceptance</th>
                      <th className="py-4 pr-6 w-28 text-center">Difficulty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProblems.map((prob, idx) => (
                      <tr 
                        key={prob._id}
                        onClick={() => navigate(`/coding/problem/${prob._id}`)}
                        className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                      >
                        <td className="py-4 pl-6 text-center">
                          <FiCheckCircle className="mx-auto text-slate-700 group-hover:text-slate-500 transition-colors" />
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="text-slate-200 font-bold group-hover:text-indigo-400 transition-colors text-sm">
                              {idx + 1 + (currentPage - 1) * itemsPerPage}. {prob.title}
                            </span>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {prob.topics?.map(topic => (
                                <span 
                                  key={topic}
                                  className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/5 text-slate-400"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center text-sm font-semibold text-slate-400">
                          {prob.acceptanceRate ? `${prob.acceptanceRate.toFixed(1)}%` : '50.0%'}
                        </td>
                        <td className="py-4 pr-6 text-center">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${getDifficultyColor(prob.difficulty)}`}>
                            {prob.difficulty}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 px-6 py-4 rounded-3xl">
              <span className="text-slate-500 text-xs font-semibold">
                Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredProblems.length)} of {filteredProblems.length} questions
              </span>
              <div className="flex items-center space-x-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-white/5 disabled:cursor-not-allowed transition-all"
                >
                  <FiChevronLeft className="text-slate-300" />
                </button>
                <span className="text-slate-300 text-xs font-bold px-3">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-white/5 disabled:cursor-not-allowed transition-all"
                >
                  <FiChevronRight className="text-slate-300" />
                </button>
              </div>
            </div>
          )}

          </div>
        </div>
      </main>
    </div>
  </div>
  );
};

export default CompanyCodingQuestionsPage;
