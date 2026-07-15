import { useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

import { motion } from 'framer-motion';
import { FaArrowLeft, FaSearch, FaCheckCircle, FaCircle, FaBuilding, FaFilter } from 'react-icons/fa';
import { CATEGORIES, getQuestionsByCategory } from '../data/questionBank';

const getProgress = () => {
  try { return JSON.parse(localStorage.getItem('coding_progress') || '{}'); } catch { return {}; }
};

const difficultyColor = {
  Easy: 'text-green-400 bg-green-400/10 border-green-400/20',
  Medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  Hard: 'text-red-400 bg-red-400/10 border-red-400/20',
};

const CodingTopicPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const progress = getProgress();

  // Parse recruitment simulation query parameters
  const params = useMemo(() => new URLSearchParams(window.location.search), [window.location.search]);
  const isSim = params.get('sim') === 'true';
  const company = params.get('company') || '';
  const role = params.get('role') || '';
  const roundIndex = params.get('roundIndex') || '0';
  const roundName = params.get('roundName') || '';
  const difficulty = params.get('difficulty') || 'All';

  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState(isSim && difficulty !== 'All' ? difficulty : 'All');
  const [topicFilter, setTopicFilter] = useState('All');
  const [companyFilter, setCompanyFilter] = useState(isSim && company ? company : 'All Companies');

  const cat = CATEGORIES.find(c => c.id === category);
  const questions = useMemo(() => getQuestionsByCategory(category), [category]);

  const uniqueTopics = useMemo(() => ['All', ...new Set(questions.map(q => q.topic))], [questions]);
  
  // Extract all unique companies and sort them
  const uniqueCompanies = useMemo(() => {
    const companies = new Set();
    questions.forEach(q => {
      q.companies?.forEach(c => companies.add(c));
    });
    return ['All Companies', ...Array.from(companies).sort()];
  }, [questions]);

  const filtered = useMemo(() => {
    return questions.filter(q => {
      // If in simulation, force company and difficulty matches (with fallback if zero matches)
      const activeCompany = isSim ? company : companyFilter;
      const matchCompany = activeCompany === 'All Companies' || activeCompany === '' || q.companies.includes(activeCompany);
      
      const activeDiff = isSim ? (difficulty !== 'All' ? difficulty : diffFilter) : diffFilter;
      const matchDiff = activeDiff === 'All' || q.difficulty === activeDiff;

      const matchSearch = isSim ? true : (
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        q.topic.toLowerCase().includes(search.toLowerCase()) ||
        q.companies.some(c => c.toLowerCase().includes(search.toLowerCase()))
      );
      
      const matchTopic = topicFilter === 'All' || q.topic === topicFilter;
      
      return matchSearch && matchDiff && matchTopic && matchCompany;
    });
  }, [questions, search, diffFilter, topicFilter, companyFilter, isSim, company, difficulty]);

  const solvedCount = questions.filter(q => progress[q.id]).length;

  if (!cat) return (
    <div className="flex h-screen bg-background items-center justify-center text-foreground">
      Category not found. <Link to="/coding" className="text-indigo-400 ml-2">Go back</Link>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="relative z-10 flex-1 pl-0 md:pl-[72px] flex flex-col h-screen overflow-hidden">
        <Navbar subtitle={`${cat.name} Category`} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar">
          {/* Breadcrumb */}
          <button onClick={() => navigate('/coding')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
            <FaArrowLeft /> Back to Practice Hub
          </button>

          {/* Category Header */}
          <div className={`bg-card border border-border shadow-sm rounded-2xl p-6 mb-8 border ${cat.borderColor} relative overflow-hidden`}>
            <div className={`absolute -right-8 -top-8 text-9xl opacity-10`}>{cat.icon}</div>
            <div className="relative z-10 flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{cat.icon}</span>
                  <h1 className="text-2xl font-black text-foreground">{cat.name}</h1>
                </div>
                <p className="text-muted-foreground mb-4">{cat.description}</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-400">Easy: {questions.filter(q => q.difficulty === 'Easy').length}</span>
                  <span className="text-amber-400">Medium: {questions.filter(q => q.difficulty === 'Medium').length}</span>
                  <span className="text-red-400">Hard: {questions.filter(q => q.difficulty === 'Hard').length}</span>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="text-4xl font-black text-foreground">{solvedCount}/{questions.length}</div>
                <div className="text-muted-foreground text-sm">Solved</div>
                <div className="w-32 h-2 bg-card rounded-full mt-2 overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${cat.color} rounded-full`}
                    style={{ width: `${questions.length ? (solvedCount / questions.length * 100) : 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          {isSim ? (
            /* Simulation Branding Banner */
            <div className="bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-500/30 rounded-2xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_0_25px_rgba(99,102,241,0.05)] relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-500/5 blur-2xl rounded-full"></div>
              <div>
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md mb-2 inline-block">
                  🏢 {company} Recruitment Simulation Mode
                </span>
                <h3 className="text-xl font-bold text-foreground mb-1">Round {parseInt(roundIndex, 10) + 1}: {roundName || cat.name}</h3>
                <p className="text-xs text-muted-foreground">Target Role: <strong className="text-muted-foreground">{role}</strong> | Target Difficulty: <strong className="text-muted-foreground">{difficulty}</strong></p>
              </div>
              <div className="text-xs text-muted-foreground max-w-sm border-l border-border pl-4 py-1 leading-relaxed">
                Choose any question below. Submitting a solution with score <strong className="text-green-400 font-bold">&gt;= 60%</strong> will verify and pass this round, unlocking the next step.
              </div>
            </div>
          ) : (
            /* Standard Filters */
            <>
              {/* Filters Row 1: Search & Difficulty */}
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
                  <input
                    type="text"
                    placeholder="Search by title, topic, or company..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-card border border-slate-700 text-foreground rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex gap-2">
                  {['All', 'Easy', 'Medium', 'Hard'].map(d => (
                    <button key={d} onClick={() => setDiffFilter(d)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        diffFilter === d
                          ? d === 'Easy' ? 'bg-green-600 text-foreground' : d === 'Medium' ? 'bg-amber-600 text-foreground' : d === 'Hard' ? 'bg-red-600 text-foreground' : 'bg-indigo-600 text-foreground'
                          : 'bg-card text-muted-foreground hover:bg-slate-700'
                      }`}>{d}</button>
                  ))}
                </div>
              </div>

              {/* Filters Row 2: Company Filter */}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5 mr-2"><FaBuilding /> Companies:</div>
                {uniqueCompanies.slice(0, 10).map(c => (
                  <button key={c} onClick={() => setCompanyFilter(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      companyFilter === c 
                      ? 'bg-blue-600 border-blue-600 text-foreground' 
                      : 'bg-card border-slate-700 text-muted-foreground hover:border-blue-500 hover:text-foreground'
                    }`}>
                    {c}
                  </button>
                ))}
                {uniqueCompanies.length > 10 && (
                  <select 
                    value={uniqueCompanies.slice(0, 10).includes(companyFilter) ? '' : companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border focus:outline-none ${
                      !uniqueCompanies.slice(0, 10).includes(companyFilter) && companyFilter !== 'All Companies'
                      ? 'bg-blue-600 border-blue-600 text-foreground' 
                      : 'bg-card border-slate-700 text-muted-foreground hover:border-blue-500 hover:text-foreground'
                    }`}
                  >
                    <option value="" disabled>More Companies...</option>
                    {uniqueCompanies.slice(10).map(c => (
                      <option key={c} value={c} className="bg-card text-foreground">{c}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Topic Filter Pills */}
              {uniqueTopics.length > 2 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  <FaFilter className="text-muted-foreground text-xs mt-1.5" />
                  {uniqueTopics.map(t => (
                    <button key={t} onClick={() => setTopicFilter(t)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${topicFilter === t ? 'bg-indigo-600 border-indigo-600 text-foreground' : 'bg-card border-slate-700 text-muted-foreground hover:border-indigo-500 hover:text-foreground'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Question Count */}
          <div className="text-muted-foreground text-sm mb-4">Showing {filtered.length} of {questions.length} questions</div>

          {/* Questions Table */}
          <div className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="text-left p-4 w-8">#</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4 flex-1">Title</th>
                  <th className="text-left p-4">Topic</th>
                  <th className="text-left p-4">Difficulty</th>
                  <th className="text-left p-4">Companies</th>
                  <th className="text-left p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q, i) => {
                  const solved = !!progress[q.id];
                  const qLink = isSim 
                    ? `/coding/problem/${q.id}?sim=true&company=${encodeURIComponent(company)}&role=${encodeURIComponent(role)}&roundIndex=${roundIndex}` 
                    : `/coding/problem/${q.id}`;
                  return (
                    <motion.tr key={q.id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                      className={`border-b border-border/50 hover:bg-card/30 transition-colors ${solved ? 'bg-green-500/3' : ''}`}>
                      <td className="p-4 text-muted-foreground text-sm">{i + 1}</td>
                      <td className="p-4">
                        {solved
                          ? <FaCheckCircle className="text-green-500 text-lg" />
                          : <FaCircle className="text-slate-700 text-lg" />}
                      </td>
                      <td className="p-4">
                        <Link to={qLink} className="text-foreground hover:text-indigo-400 font-medium transition-colors">
                          {q.title}
                        </Link>
                      </td>
                      <td className="p-4">
                        <span className="text-xs bg-card text-muted-foreground border border-slate-700 px-2 py-1 rounded-full">{q.topic}</span>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${difficultyColor[q.difficulty]}`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1 flex-wrap">
                          {q.companies.slice(0, 2).map(c => (
                            <span key={c} className="text-[10px] bg-card text-muted-foreground border border-slate-700 px-2 py-0.5 rounded flex items-center gap-1">
                              <FaBuilding className="text-[8px]" />{c}
                            </span>
                          ))}
                          {q.companies.length > 2 && <span className="text-[10px] text-muted-foreground">+{q.companies.length - 2}</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        <Link to={qLink}
                          className="text-xs bg-indigo-600 hover:bg-indigo-500 text-foreground px-3 py-1.5 rounded-lg transition-colors font-medium">
                          Solve →
                        </Link>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <div className="text-4xl mb-3">🔍</div>
                <p>No questions found matching your filters.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CodingTopicPage;
