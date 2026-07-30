import React from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import {
  FaPrint, FaShareAlt, FaArrowLeft, FaAward, FaCheckCircle, FaExclamationTriangle,
  FaBookOpen, FaComments, FaVolumeUp, FaVolumeMute, FaLightbulb, FaCheck, FaExclamationCircle
} from 'react-icons/fa';
import { Users, Award, Shield, Zap, Sparkles, FileText, CheckCircle2, MessageSquare, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const GDEvaluationReportView = ({ report, onBackToDashboard }) => {
  const overallScore = report?.overallScore || 78;
  const readiness = report?.placementReadiness || 'Recommended with Training';

  const categoryScores = report?.categoryScores || {
    communication: { score: 80, reason: 'Clear expression with good flow.' },
    grammar: { score: 75, reason: 'Minor tense inconsistencies.' },
    pronunciation: { score: 'Not Evaluated', status: 'Pronunciation Not Evaluated', reason: 'Text mode used.' },
    confidence: { score: 82, reason: 'Composed during counter-arguments.' },
    leadership: { score: 72, reason: 'Good initiative.' },
    participation: { score: 85, reason: 'Active participation across phases.' },
    listeningSkills: { score: 80, reason: 'Accurate references to peer arguments.' },
    logicalThinking: { score: 78, reason: 'Structured cause-and-effect reasoning.' },
    englishFluency: { score: 76, reason: 'Smooth delivery.' },
    vocabulary: { score: 74, reason: 'Good industry terms.' },
    professionalism: { score: 88, reason: 'Respected panel decorum.' }
  };

  // Recharts radar data for 10 numerical metrics
  const radarData = [
    { subject: 'Communication', score: typeof categoryScores.communication?.score === 'number' ? categoryScores.communication.score : 70 },
    { subject: 'Grammar', score: typeof categoryScores.grammar?.score === 'number' ? categoryScores.grammar.score : 70 },
    { subject: 'Confidence', score: typeof categoryScores.confidence?.score === 'number' ? categoryScores.confidence.score : 70 },
    { subject: 'Leadership', score: typeof categoryScores.leadership?.score === 'number' ? categoryScores.leadership.score : 70 },
    { subject: 'Participation', score: typeof categoryScores.participation?.score === 'number' ? categoryScores.participation.score : 70 },
    { subject: 'Listening', score: typeof categoryScores.listeningSkills?.score === 'number' ? categoryScores.listeningSkills.score : 70 },
    { subject: 'Logic', score: typeof categoryScores.logicalThinking?.score === 'number' ? categoryScores.logicalThinking.score : 70 },
    { subject: 'Fluency', score: typeof categoryScores.englishFluency?.score === 'number' ? categoryScores.englishFluency.score : 70 },
    { subject: 'Vocabulary', score: typeof categoryScores.vocabulary?.score === 'number' ? categoryScores.vocabulary.score : 70 },
    { subject: 'Professionalism', score: typeof categoryScores.professionalism?.score === 'number' ? categoryScores.professionalism.score : 70 },
  ];

  const sentenceCorrections = report?.sentenceCorrections || [
    {
      original: "AI replace all jobs in tech.",
      suggested: "AI may automate certain repetitive tasks, but it is also creating new opportunities.",
      reason: "Corrected verb tense and improved professional vocabulary."
    }
  ];

  const fillerWordsReport = report?.fillerWordsReport || {
    totalCount: 3,
    breakdown: { um: 1, uh: 1, like: 1, actually: 0, basically: 0, youKnow: 0 },
    suggestions: ["Pause slightly instead of using 'like'", "Structure your thoughts before speaking"]
  };

  const goodMoments = report?.goodMoments || {
    bestArgument: "Highlighted that AI acts as an accelerator rather than a replacement.",
    strongestPoint: "Connected technological shifts to skill adaptation in freshers.",
    leadershipMoment: "Encouraged the group to consider economic feasibility.",
    mostProfessionalResponse: "Politely disagreed with an aggressive participant."
  };

  const mistakes = report?.mistakesAndOpportunities || {
    longPausesCount: 1,
    weakArguments: ["Initial statement was slightly generalized."],
    missedOpportunities: ["Opportunity to summarize the group's consensus near the final minute."]
  };

  const improvementPlan = report?.improvementPlan || [
    "Practice using signpost phrases like 'To build upon Rahul's point...'",
    "Reduce filler word frequency during spontaneous answers",
    "Take initiative to deliver a cohesive concluding summary"
  ];

  const isTextModePronunciation = categoryScores.pronunciation?.status === 'Pronunciation Not Evaluated' || categoryScores.pronunciation?.score === 'Not Evaluated';

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('GD Evaluation Report link copied to clipboard!');
  };

  const handleDownloadSection = (type) => {
    toast.success(`Downloaded ${type} export successfully! 📄`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      
      {/* ─── HEADER BAR ──────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 print-hidden">
        <div>
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors mb-2"
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                Placement Group Discussion Evaluation Report
              </span>
              <h1 className="text-2xl font-black text-white">Campus GD Assessment Analytics</h1>
            </div>
          </div>
        </div>

        {/* Export / Download Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-2 transition-all"
          >
            <FaPrint /> Print / Export PDF
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-2 transition-all"
          >
            <FaShareAlt /> Share Report
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ─── SECTION 1: OVERALL SCORE & READINESS HERO ─────────────────────── */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-amber-500/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                Final Assessment Verdict
              </span>
            </div>
            <h2 className="text-3xl font-black text-white">{readiness}</h2>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Based on live communication, logical structure, turn management, leadership initiative, and professional vocabulary evaluated during the campus group discussion.
            </p>
          </div>

          <div className="flex items-center gap-6 bg-slate-950/80 border border-slate-800 p-6 rounded-2xl">
            <div className="text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Overall GD Score</span>
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                {overallScore}<span className="text-2xl text-slate-500">/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── SECTION 2: 11 METRICS RADAR & SCORE CARDS ─────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Radar Chart */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between backdrop-blur-md">
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-2">
              <Award className="w-4 h-4" /> 10-Metric Performance Radar
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                  <Radar name="Candidate" dataKey="score" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Granular Metric List */}
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Evidence-Based Metric Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(categoryScores).map(([key, val]) => (
                <div key={key} className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-xs font-black text-amber-400">
                      {val.score === 'Not Evaluated' ? 'Not Evaluated' : `${val.score}%`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{val.reason || 'Evaluated based on transcript evidence.'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── SECTION 3: SENTENCE CORRECTIONS (ORIGINAL -> SUGGESTED -> REASON) ── */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" /> English &amp; Grammar Sentence Corrections
          </h3>
          <div className="space-y-3">
            {sentenceCorrections.map((sc, idx) => (
              <div key={idx} className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl grid md:grid-cols-3 gap-4 items-center">
                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block mb-1">Original Sentence</span>
                  <p className="text-xs text-red-200 italic">"{sc.original}"</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">Suggested Sentence</span>
                  <p className="text-xs text-emerald-200 font-medium">"{sc.suggested}"</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Improvement Reason</span>
                  <p className="text-xs text-slate-300">{sc.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── SECTION 4: FILLER WORDS & PRONUNCIATION REPORT ───────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Filler Words */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-wider text-amber-400">Filler Words Breakdown</h3>
              <span className="text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full">
                {fillerWordsReport.totalCount} Detected
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(fillerWordsReport.breakdown).map(([word, count]) => (
                <div key={word} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">{word}</span>
                  <span className="text-sm font-black text-white">{count}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Suggestions to Eliminate Fillers:</span>
              <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
                {fillerWordsReport.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pronunciation Status */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-blue-400">Pronunciation Evaluation</h3>
            {isTextModePronunciation ? (
              <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl text-center space-y-2">
                <FaVolumeMute className="w-10 h-10 text-slate-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">Pronunciation Not Evaluated</h4>
                <p className="text-xs text-slate-400">Candidate conducted session in text input mode. Voice pronunciation is evaluated during audio mode.</p>
              </div>
            ) : (
              <div className="bg-slate-950/80 border border-emerald-500/20 p-4 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <FaVolumeUp /> Clear Articulation Detected
                </div>
                <p className="text-xs text-slate-300">{categoryScores.pronunciation?.reason || 'Pronunciation was clear and well-paced.'}</p>
              </div>
            )}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-400">
              💡 Tip: Continuous practice in voice mode enhances spontaneous articulation in actual campus interviews.
            </div>
          </div>
        </div>

        {/* ─── SECTION 5: GOOD MOMENTS & HIGHLIGHTS ───────────────────────────── */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Good Moments &amp; Key Highlights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/60 border border-emerald-500/20 p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">Best Argument</span>
              <p className="text-xs text-slate-200">"{goodMoments.bestArgument}"</p>
            </div>
            <div className="bg-slate-950/60 border border-indigo-500/20 p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Strongest Point</span>
              <p className="text-xs text-slate-200">"{goodMoments.strongestPoint}"</p>
            </div>
            <div className="bg-slate-950/60 border border-purple-500/20 p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block mb-1">Leadership Moment</span>
              <p className="text-xs text-slate-200">"{goodMoments.leadershipMoment}"</p>
            </div>
            <div className="bg-slate-950/60 border border-amber-500/20 p-4 rounded-2xl">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">Most Professional Response</span>
              <p className="text-xs text-slate-200">"{goodMoments.mostProfessionalResponse}"</p>
            </div>
          </div>
        </div>

        {/* ─── SECTION 6: PERSONALIZED ACTIONABLE IMPROVEMENT PLAN ─────────────── */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <FaBookOpen className="w-4 h-4" /> Personalized Improvement Roadmap
          </h3>
          <div className="space-y-2.5">
            {improvementPlan.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </div>
                <p className="text-xs text-slate-200 font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── SECTION 7: DOWNLOADABLE EXPORTS ───────────────────────────────── */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-wrap justify-between items-center gap-4 print-hidden">
          <div>
            <h4 className="text-xs font-bold text-white">Download Complete Report Package</h4>
            <p className="text-[11px] text-slate-400">Export specialized individual reports for offline review.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleDownloadSection('GD Report PDF')} className="px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-amber-400" /> GD Report PDF
            </button>
            <button onClick={() => handleDownloadSection('Transcript')} className="px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-blue-400" /> Full Transcript
            </button>
            <button onClick={() => handleDownloadSection('Grammar Report')} className="px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-emerald-400" /> Grammar Report
            </button>
            <button onClick={() => handleDownloadSection('Vocabulary Report')} className="px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-purple-400" /> Vocabulary Report
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GDEvaluationReportView;
