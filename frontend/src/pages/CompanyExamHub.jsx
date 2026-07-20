import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Clock, Users, BookOpen, ChevronRight,
  Shield, AlertTriangle, Monitor, Eye, Wifi, CheckCircle,
  Award, Target, BarChart3, Zap, Lock, ArrowLeft
} from 'lucide-react';
import { getCompanyConfig } from '../data/examConfigs';

// Company Logo SVG Text
const CompanyBadge = ({ company, size = 'md' }) => {
  const sz = size === 'lg' ? 'w-20 h-20 text-2xl' : size === 'md' ? 'w-14 h-14 text-lg' : 'w-10 h-10 text-sm';
  return (
    <div
      className={`${sz} rounded-2xl flex items-center justify-center font-black text-white shadow-2xl flex-shrink-0`}
      style={{ background: `linear-gradient(135deg, ${company.accent}, ${company.accentLight})`, boxShadow: `0 8px 32px ${company.accentGlow}` }}
    >
      {company.logo}
    </div>
  );
};

const CompanyExamHub = () => {
  const { company: companyId } = useParams();
  const navigate = useNavigate();

  const company = getCompanyConfig(companyId);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [step, setStep] = useState('select'); // select | rules | verify | ready

  if (!company) {
    return (
      <div className="min-h-screen bg-[#070711] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏢</div>
          <h2 className="text-2xl font-bold text-white mb-2">Company Not Found</h2>
          <p className="text-slate-400 mb-6">The company "{companyId}" is not available yet.</p>
          <button onClick={() => navigate('/companies')} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold">
            Browse Companies
          </button>
        </div>
      </div>
    );
  }

  const handleStartExam = () => {
    if (!selectedTrack) return;
    navigate(`/exam/${companyId}/${selectedTrack.id}`);
  };

  const accentStyle = { color: company.accentLight };
  const accentBg = { backgroundColor: company.accent };
  const accentGlow = { boxShadow: `0 0 30px ${company.accentGlow}` };

  return (
    <div className="min-h-screen bg-[#070711] relative overflow-hidden">

      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-[500px]"
          style={{ background: `radial-gradient(ellipse 80% 60% at 50% -10%, ${company.accentGlow} 0%, transparent 70%)` }} />
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-10"
        >
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4 flex-1">
            <CompanyBadge company={company} size="lg" />
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Assessment Portal</p>
              <h1 className="text-3xl font-black text-white">{company.fullName}</h1>
              <p className="text-slate-400 text-sm mt-0.5">{company.tagline}</p>
            </div>
          </div>
          <div
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold"
            style={{ borderColor: company.accentGlow, color: company.accentLight, backgroundColor: `${company.accent}15` }}
          >
            <div className="w-2 h-2 rounded-full animate-pulse" style={accentBg} />
            {company.type === 'product' ? 'Online Assessment' : 'Aptitude Test'}
          </div>
        </motion.div>

        {/* Step: Track Selection */}
        <AnimatePresence mode="wait">
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Select Your Hiring Track</h2>
                <p className="text-slate-400">Choose the track you are applying for. Each track has a different assessment structure.</p>
              </div>

              <div className="grid gap-4">
                {company.tracks.map((track, i) => (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => setSelectedTrack(track)}
                    className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 group ${
                      selectedTrack?.id === track.id
                        ? 'border-opacity-100 bg-white/5'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/5'
                    }`}
                    style={selectedTrack?.id === track.id ? { borderColor: company.accent, boxShadow: `0 0 20px ${company.accentGlow}` } : {}}
                  >
                    {selectedTrack?.id === track.id && (
                      <div className="absolute top-4 right-4">
                        <CheckCircle className="w-6 h-6" style={{ color: company.accentLight }} />
                      </div>
                    )}

                    <div className="flex items-start gap-5">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-black flex-shrink-0"
                        style={{ backgroundColor: `${company.accent}25`, border: `1px solid ${company.accent}40` }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-white mb-1">{track.name}</h3>
                        <p className="text-slate-400 text-sm mb-4">{track.description}</p>

                        {/* Stats row */}
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Clock className="w-4 h-4" />
                            <span>{track.duration}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <BookOpen className="w-4 h-4" />
                            <span>{track.sections.length} Sections</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <Target className="w-4 h-4" />
                            <span>{track.totalQuestions} Questions</span>
                          </div>
                          <div
                            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                            style={{ backgroundColor: `${company.accent}20`, color: company.accentLight }}
                          >
                            <Users className="w-3 h-3" />
                            {track.eligibility}
                          </div>
                        </div>

                        {/* Sections breakdown */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          {track.sections.map((sec, si) => (
                            <div
                              key={sec.id}
                              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400"
                            >
                              <span>{sec.icon}</span>
                              <span>{sec.name}</span>
                              <span className="text-slate-600">•</span>
                              <span>{sec.questions}Q</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 flex justify-end"
              >
                <button
                  onClick={() => { if (selectedTrack) setStep('rules'); }}
                  disabled={!selectedTrack}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white text-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: `linear-gradient(135deg, ${company.accent}, ${company.accentLight})`, ...accentGlow }}
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* Step: Rules & Instructions */}
          {step === 'rules' && (
            <motion.div
              key="rules"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <button onClick={() => setStep('select')} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-4 transition-all">
                  <ArrowLeft className="w-4 h-4" /> Back to Track Selection
                </button>
                <h2 className="text-2xl font-bold text-white mb-1">Assessment Instructions</h2>
                <p className="text-slate-400">Please read all instructions carefully before proceeding.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {/* Proctoring */}
                <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-red-400" />
                    </div>
                    <h3 className="font-bold text-red-400">Proctoring Active</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-400">
                    <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-red-400/70 flex-shrink-0 mt-0.5" />Full screen mode is mandatory</li>
                    <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-red-400/70 flex-shrink-0 mt-0.5" />Tab switching will be recorded</li>
                    <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-red-400/70 flex-shrink-0 mt-0.5" />3 violations = auto-submit</li>
                    <li className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-red-400/70 flex-shrink-0 mt-0.5" />Camera access may be required</li>
                  </ul>
                </div>

                {/* Technical Requirements */}
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Monitor className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="font-bold text-slate-300">System Requirements</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-400">
                    <li className="flex items-center gap-2"><Wifi className="w-4 h-4 text-blue-400/70" />Stable internet connection</li>
                    <li className="flex items-center gap-2"><Monitor className="w-4 h-4 text-blue-400/70" />Desktop/laptop recommended</li>
                    <li className="flex items-center gap-2"><Eye className="w-4 h-4 text-blue-400/70" />JavaScript must be enabled</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-400/70" />Browser: Chrome/Firefox</li>
                  </ul>
                </div>

                {/* Assessment Details */}
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${company.accent}25` }}>
                      <BarChart3 className="w-5 h-5" style={accentStyle} />
                    </div>
                    <h3 className="font-bold text-slate-300">Assessment Details</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-400">
                    <li className="flex justify-between"><span>Total Duration:</span> <span className="text-white font-semibold">{selectedTrack?.duration}</span></li>
                    <li className="flex justify-between"><span>Sections:</span> <span className="text-white font-semibold">{selectedTrack?.sections.length}</span></li>
                    <li className="flex justify-between"><span>Total Questions:</span> <span className="text-white font-semibold">{selectedTrack?.totalQuestions}</span></li>
                    <li className="flex justify-between"><span>Section Locking:</span> <span className="text-white font-semibold">{selectedTrack?.locked ? 'Yes' : 'No'}</span></li>
                  </ul>
                </div>

                {/* Section Flow */}
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${company.accent}25` }}>
                      <Zap className="w-5 h-5" style={accentStyle} />
                    </div>
                    <h3 className="font-bold text-slate-300">Section Flow</h3>
                  </div>
                  <div className="space-y-2">
                    {selectedTrack?.sections.map((sec, i) => (
                      <div key={sec.id} className="flex items-center gap-2 text-sm text-slate-400">
                        <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0"
                          style={{ backgroundColor: `${company.accent}30`, color: company.accentLight }}>
                          {i + 1}
                        </span>
                        <span>{sec.icon} {sec.name}</span>
                        <span className="ml-auto text-xs">{sec.duration} min</span>
                        {selectedTrack.locked && <Lock className="w-3 h-3 text-slate-600" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Important Note */}
              <div className="p-4 rounded-xl border mb-6" style={{ borderColor: `${company.accent}40`, backgroundColor: `${company.accent}08` }}>
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 flex-shrink-0 mt-0.5" style={accentStyle} />
                  <div>
                    <p className="font-semibold text-white text-sm mb-1">Assessment Integrity</p>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      This assessment is designed to evaluate your skills accurately. Attempting to use external resources,
                      browser developer tools, or any form of assistance is strictly prohibited and may result in disqualification.
                      Results will not reveal individual answers — only scores and performance analytics will be shared.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button onClick={() => setStep('select')} className="px-6 py-3 rounded-xl border border-white/15 text-slate-400 hover:text-white hover:border-white/30 font-semibold transition-all">
                  ← Back
                </button>
                <button
                  onClick={() => setStep('verify')}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white text-lg transition-all"
                  style={{ background: `linear-gradient(135deg, ${company.accent}, ${company.accentLight})`, ...accentGlow }}
                >
                  I Understand, Proceed
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step: Candidate Verification */}
          {step === 'verify' && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="max-w-xl mx-auto"
            >
              <button onClick={() => setStep('rules')} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-all">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10">
                <div className="text-center mb-8">
                  <CompanyBadge company={company} size="lg" />
                  <h2 className="text-2xl font-bold text-white mt-4 mb-1">Candidate Verification</h2>
                  <p className="text-slate-400 text-sm">Confirm your details before starting the assessment</p>
                </div>

                {/* Candidate ID */}
                <div className="space-y-4 mb-8">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Candidate ID</p>
                    <p className="text-white font-mono font-bold text-lg">IX-{Math.floor(Math.random() * 900000) + 100000}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Assessment</p>
                    <p className="text-white font-semibold">{company.name} — {selectedTrack?.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs text-slate-500 mb-1">Duration</p>
                      <p className="text-white font-bold">{selectedTrack?.duration}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs text-slate-500 mb-1">Sections</p>
                      <p className="text-white font-bold">{selectedTrack?.sections.length} Sections</p>
                    </div>
                  </div>
                </div>

                {/* System Check */}
                <div className="space-y-2 mb-8">
                  <p className="text-sm font-semibold text-slate-300 mb-3">System Check</p>
                  {[
                    { label: 'Browser Compatibility', status: 'pass' },
                    { label: 'JavaScript Enabled', status: 'pass' },
                    { label: 'Screen Resolution', status: 'pass' },
                    { label: 'Internet Connection', status: 'pass' },
                  ].map((check, i) => (
                    <div key={i} className="flex items-center justify-between text-sm p-2 rounded-lg bg-white/[0.02]">
                      <span className="text-slate-400">{check.label}</span>
                      <span className="flex items-center gap-1.5 text-green-400 font-semibold">
                        <CheckCircle className="w-4 h-4" /> Ready
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleStartExam}
                  className="w-full py-4 rounded-2xl font-bold text-white text-lg transition-all flex items-center justify-center gap-3"
                  style={{ background: `linear-gradient(135deg, ${company.accent}, ${company.accentLight})`, ...accentGlow }}
                >
                  <Monitor className="w-5 h-5" />
                  Start Assessment (Full Screen)
                </button>

                <p className="text-center text-xs text-slate-500 mt-3">
                  Clicking the button will enter full-screen mode and start the timer
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CompanyExamHub;
