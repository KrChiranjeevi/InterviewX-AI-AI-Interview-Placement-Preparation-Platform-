import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserGraduate, FaCode, FaBuilding, FaClock, FaCalendarAlt, FaCheck, FaTimes } from 'react-icons/fa';

const STEPS = [
  { id: 'role', title: 'Target Role', icon: <FaUserGraduate /> },
  { id: 'skills', title: 'Current Skills', icon: <FaCode /> },
  { id: 'company', title: 'Target Company', icon: <FaBuilding /> },
  { id: 'time', title: 'Study Time', icon: <FaClock /> },
];

const RoadmapWizard = ({ isOpen, onClose, onGenerate }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    targetRole: '',
    experienceLevel: 'Beginner',
    currentSkills: [],
    preferredLanguage: 'JavaScript',
    targetCompany: '',
    dsaLevel: 'Beginner',
    studyTime: '2 hours',
    targetDate: '3 Months',
    strengths: [],
    weaknesses: []
  });

  const [skillInput, setSkillInput] = useState('');

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(prev => prev + 1);
    else onGenerate(formData);
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!formData.currentSkills.includes(skillInput.trim())) {
        setFormData({ ...formData, currentSkills: [...formData.currentSkills, skillInput.trim()] });
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setFormData({ ...formData, currentSkills: formData.currentSkills.filter(s => s !== skill) });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">What role are you targeting?</label>
              <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Full Stack Developer, Data Scientist" value={formData.targetRole} onChange={e => setFormData({ ...formData, targetRole: e.target.value })} autoFocus />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Experience Level</label>
              <select className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500" value={formData.experienceLevel} onChange={e => setFormData({ ...formData, experienceLevel: e.target.value })}>
                <option value="Beginner">Beginner (0-1 yrs)</option>
                <option value="Intermediate">Intermediate (1-3 yrs)</option>
                <option value="Advanced">Advanced (3+ yrs)</option>
              </select>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Add your current skills (Press Enter)</label>
              <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500" placeholder="e.g. React, Python, Node.js" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={handleAddSkill} />
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.currentSkills.map(skill => (
                  <span key={skill} className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {skill} <FaTimes className="cursor-pointer hover:text-white" onClick={() => removeSkill(skill)} />
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Preferred Programming Language</label>
              <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500" placeholder="e.g. JavaScript, C++, Java" value={formData.preferredLanguage} onChange={e => setFormData({ ...formData, preferredLanguage: e.target.value })} />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Target Company (Optional)</label>
              <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Google, Amazon, TCS" value={formData.targetCompany} onChange={e => setFormData({ ...formData, targetCompany: e.target.value })} />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Current DSA Level</label>
              <select className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500" value={formData.dsaLevel} onChange={e => setFormData({ ...formData, dsaLevel: e.target.value })}>
                <option value="Beginner">Beginner (Arrays, Strings)</option>
                <option value="Medium">Medium (Trees, Graphs, DP basics)</option>
                <option value="Advanced">Advanced (Hard DP, Advanced Graphs)</option>
              </select>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Daily Study Time</label>
              <select className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500" value={formData.studyTime} onChange={e => setFormData({ ...formData, studyTime: e.target.value })}>
                <option value="1 hour">1 hour</option>
                <option value="2-3 hours">2-3 hours</option>
                <option value="4+ hours">4+ hours</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Target Placement Date</label>
              <select className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500" value={formData.targetDate} onChange={e => setFormData({ ...formData, targetDate: e.target.value })}>
                <option value="1 Month">1 Month</option>
                <option value="3 Months">3 Months</option>
                <option value="6 Months">6 Months</option>
              </select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg w-full relative overflow-hidden shadow-2xl">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 flex">
          {STEPS.map((step, idx) => (
            <div key={idx} className={`h-1.5 flex-1 ${idx <= currentStep ? 'bg-indigo-500' : 'bg-slate-800'}`} />
          ))}
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <FaTimes />
        </button>

        <div className="text-center mb-8 mt-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 text-2xl mb-4">
            {STEPS[currentStep].icon}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{STEPS[currentStep].title}</h2>
          <p className="text-slate-400 text-sm">Step {currentStep + 1} of {STEPS.length}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={currentStep} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.2 }}>
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-10">
          <button onClick={() => setCurrentStep(prev => prev - 1)} disabled={currentStep === 0} className={`px-6 py-2.5 rounded-xl font-medium ${currentStep === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:bg-slate-800'}`}>
            Back
          </button>
          <button onClick={handleNext} disabled={currentStep === 0 && !formData.targetRole.trim()} className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {currentStep === STEPS.length - 1 ? 'Generate Roadmap' : 'Next'} <FaCheck className="text-sm" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RoadmapWizard;
