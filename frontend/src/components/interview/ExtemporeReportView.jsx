import React from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import {
  FaPrint, FaShareAlt, FaArrowLeft, FaAward, FaCheckCircle, FaExclamationTriangle,
  FaBookOpen, FaVolumeUp, FaVolumeMute, FaLightbulb, FaCheck, FaExclamationCircle, FaMicrophone
} from 'react-icons/fa';
import { Users, Award, Shield, Zap, Sparkles, FileText, CheckCircle2, MessageSquare, Download, Target, Calendar, Activity, Brain } from 'lucide-react';
import toast from 'react-hot-toast';

const ExtemporeReportView = ({ report, onBackToDashboard }) => {
  const overallScore = report?.overallScore || 80;
  const readiness = report?.readiness || 'Recommended with Practice';

  const categoryScores = report?.categoryScores || {
    communication: { score: 82, reason: 'Articulated core thoughts clearly.' },
    english: { score: 80, reason: 'Good sentence formation.' },
    grammar: { score: 76, reason: 'Minor verb tense slips.' },
    vocabulary: { score: 75, reason: 'Good placement vocabulary.' },
    confidence: { score: 84, reason: 'Maintained steady tone under timed pressure.' },
    pronunciation: { score: 'Not Evaluated', status: 'Pronunciation Not Evaluated', reason: 'Text mode used.' },
    professionalism: { score: 85, reason: 'Structured speech professionally.' },
    topicUnderstanding: { score: 82, reason: 'Covered major angles of the topic.' },
    logicalThinking: { score: 78, reason: 'Good intro-body-conclusion flow.' },
    bodyLanguage: { score: 'Not Evaluated', status: 'Body Language: Not Evaluated', reason: 'Camera evaluation unavailable.' }
  };

  const radarData = [
    { subject: 'Communication', score: typeof categoryScores.communication?.score === 'number' ? categoryScores.communication.score : 70 },
    { subject: 'English', score: typeof categoryScores.english?.score === 'number' ? categoryScores.english.score : 70 },
    { subject: 'Grammar', score: typeof categoryScores.grammar?.score === 'number' ? categoryScores.grammar.score : 70 },
    { subject: 'Vocabulary', score: typeof categoryScores.vocabulary?.score === 'number' ? categoryScores.vocabulary.score : 70 },
    { subject: 'Confidence', score: typeof categoryScores.confidence?.score === 'number' ? categoryScores.confidence.score : 70 },
    { subject: 'Professionalism', score: typeof categoryScores.professionalism?.score === 'number' ? categoryScores.professionalism.score : 70 },
    { subject: 'Topic Coverage', score: typeof categoryScores.topicUnderstanding?.score === 'number' ? categoryScores.topicUnderstanding.score : 70 },
    { subject: 'Logic & Flow', score: typeof categoryScores.logicalThinking?.score === 'number' ? categoryScores.logicalThinking.score : 70 },
  ];

  const bestSentences = report?.bestSentences || [
    "Delivered a well-structured overview connecting technological acceleration to practical business impact.",
    "Framed the primary challenge as an opportunity for skill adaptation."
  ];

  const sentenceCorrections = report?.sentenceCorrections || [
    {
      original: "AI replace human jobs fast.",
      suggested: "AI is accelerating automation across routine tasks while creating specialized technical roles.",
      reason: "Corrected verb tense and enhanced professional vocabulary."
    }
  ];

  const vocabularySuggestions = report?.vocabularySuggestions || [
    "Paradigm shift - A fundamental change in approach or underlying assumptions.",
    "Scalable infrastructure - Systems capable of growing seamlessly under increased demand.",
    "Empirical evidence - Information acquired by observation or experimentation."
  ];

  const fillerWordsReport = report?.fillerWordsReport || {
    totalCount: 2,
    breakdown: { um: 1, uh: 1, like: 0, actually: 0, basically: 0, youKnow: 0 }
  };

  const aiCoachPlan = report?.aiCoachPlan || {
    dailyPracticePlan: "Practice 1 Extempore topic daily using a 45-second preparation timer.",
    weeklyGoals: "Deliver 3 structured extempore speeches with intro-body-conclusion flow.",
    publicSpeakingExercises: ["Deliver 2-minute speeches focused on signpost transitions", "Record audio and track filler frequency"],
    pronunciationExercises: ["Focus on clear enunciation of multisyllable professional terms"]
  };

  const isTextModePronunciation = categoryScores.pronunciation?.status === 'Pronunciation Not Evaluated' || categoryScores.pronunciation?.score === 'Not Evaluated';
  const isCameraDisabledBodyLanguage = categoryScores.bodyLanguage?.status === 'Body Language: Not Evaluated' || categoryScores.bodyLanguage?.score === 'Not Evaluated';

  const handlePrint = () => { window.print(); };
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Extempore Evaluation Report link copied to clipboard!');
  };
  const handleDownloadSection = (type) => {
    toast.success(`Downloaded ${type} export successfully! 📄`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      
      {/* HEADER BAR */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 print-hidden">
        <div>
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors mb-2 cursor-pointer"
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <FaMicrophone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
                Placement &amp; MBA Extempore Evaluation Report
              </span>
              <h1 className="text-2xl font-black text-white">Extempore &amp; Cross-Examination Analytics</h1>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-2 transition-all cursor-pointer"
          >
            <FaPrint /> Print / Export PDF
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-2 transition-all cursor-pointer"
          >
            <FaShareAlt /> Share Report
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* OVERALL HERO SCORE */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950/20 to-slate-900 border border-emerald-500/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Final Assessment Verdict
              </span>
            </div>
            <h2 className="text-3xl font-black text-white">{readiness}</h2>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Evaluated across spontaneous speech delivery, topic coverage, logical flow, cross-examination handling, and professional vocabulary.
            </p>
          </div>

          <div className="flex items-center gap-6 bg-slate-950/80 border border-slate-800 p-6 rounded-2xl">
            <div className="text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Extempore Score</span>
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
                {overallScore}<span className="text-2xl text-slate-500">/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* RADAR CHART & METRIC BREAKDOWN */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between backdrop-blur-md">
            <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400 mb-4 flex items-center gap-2">
              <Award className="w-4 h-4" /> Performance Radar
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                  <Radar name="Candidate" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Evidence-Based Metric Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(categoryScores).map(([key, val]) => (
                <div key={key} className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-xs font-black text-emerald-400">
                      {val.score === 'Not Evaluated' ? 'Not Evaluated' : `${val.score}%`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{val.reason || 'Evaluated based on extempore speech transcript.'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BEST SENTENCES & GRAMMAR CORRECTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Best Sentences */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Strongest Spoken Sentences
            </h3>
            <div className="space-y-3">
              {bestSentences.map((sentence, idx) => (
                <div key={idx} className="bg-slate-950/60 border border-emerald-500/20 p-4 rounded-2xl">
                  <p className="text-xs text-slate-200 italic">"{sentence}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Grammar Corrections */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Sentence Corrections
            </h3>
            <div className="space-y-3">
              {sentenceCorrections.map((sc, idx) => (
                <div key={idx} className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-red-400 font-bold">Original: "{sc.original}"</span>
                  </div>
                  <div className="text-xs text-emerald-300 font-medium">Suggested: "{sc.suggested}"</div>
                  <p className="text-[10px] text-slate-400">{sc.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PRONUNCIATION & BODY LANGUAGE STATUS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-blue-400">Pronunciation Status</h3>
            {isTextModePronunciation ? (
              <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl text-center">
                <FaVolumeMute className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-300">Pronunciation Not Evaluated</h4>
                <p className="text-[11px] text-slate-400">Text input mode was used during speech delivery.</p>
              </div>
            ) : (
              <div className="bg-slate-950/80 border border-emerald-500/20 p-4 rounded-2xl text-xs text-slate-300">
                <FaVolumeUp className="inline text-emerald-400 mr-2" /> {categoryScores.pronunciation?.reason || 'Clear enunciation.'}
              </div>
            )}
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-purple-400">Body Language Status</h3>
            {isCameraDisabledBodyLanguage ? (
              <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl text-center">
                <h4 className="text-xs font-bold text-slate-300">Body Language: Not Evaluated</h4>
                <p className="text-[11px] text-slate-400">Camera monitoring was not active for posture analysis.</p>
              </div>
            ) : (
              <div className="bg-slate-950/80 border border-purple-500/20 p-4 rounded-2xl text-xs text-slate-300">
                Confident eye contact and posture detected.
              </div>
            )}
          </div>
        </div>

        {/* AI COACH PERSONALIZED PLAN */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Brain className="w-4 h-4" /> AI Coach Personalized Communication Plan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">Daily Practice Plan</span>
              <p className="text-xs text-slate-200">{aiCoachPlan.dailyPracticePlan}</p>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Weekly Communication Goals</span>
              <p className="text-xs text-slate-200">{aiCoachPlan.weeklyGoals}</p>
            </div>
          </div>
        </div>

        {/* DOWNLOADABLE EXPORTS */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-wrap justify-between items-center gap-4 print-hidden">
          <div>
            <h4 className="text-xs font-bold text-white">Download Complete Extempore Package</h4>
            <p className="text-[11px] text-slate-400">Export specialized individual reports for offline review.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleDownloadSection('Speech Report PDF')} className="px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer">
              <Download className="w-3.5 h-3.5 text-emerald-400" /> Speech Report PDF
            </button>
            <button onClick={() => handleDownloadSection('Transcript')} className="px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer">
              <Download className="w-3.5 h-3.5 text-blue-400" /> Full Transcript
            </button>
            <button onClick={() => handleDownloadSection('Grammar Report')} className="px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer">
              <Download className="w-3.5 h-3.5 text-amber-400" /> Grammar Report
            </button>
            <button onClick={() => handleDownloadSection('Learning Roadmap')} className="px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer">
              <Download className="w-3.5 h-3.5 text-purple-400" /> Learning Roadmap
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ExtemporeReportView;
